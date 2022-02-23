package main.java.de.voidtech.netflixparty.handlers;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.socket.WebSocketSession;

import main.java.de.voidtech.netflixparty.annotations.Handler;
import main.java.de.voidtech.netflixparty.entities.Party;
import main.java.de.voidtech.netflixparty.entities.message.ChatMessage;
import main.java.de.voidtech.netflixparty.entities.message.MessageBuilder;
import main.java.de.voidtech.netflixparty.service.GatewayResponseService;
import main.java.de.voidtech.netflixparty.service.PartyService;

@Handler
public class ChatMessageHandler extends AbstractHandler {
	
	@Autowired
	private PartyService partyService;
	
	@Autowired
	private GatewayResponseService responder;

	@Override
	public void execute(WebSocketSession session, JSONObject data) {
		String roomID = data.getString("roomID");
		String content = data.getString("content").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
		String colour = data.getString("colour");
		String modifiers = data.getString("modifiers");
		String author = data.getString("author");

		if (partyService.getParty(roomID) == null) responder.sendError(session, "Party does not exist", this.getHandlerType());
		else {
			Party party = partyService.getParty(roomID);
			if (content.length() > 2000) responder.sendError(session, "Your message is too long! Messages cannot be longer than 2000 characters.", this.getHandlerType());
			else {
				ChatMessage userMessage = new MessageBuilder()
						.partyID(roomID)
						.content(content)
						.colour(colour)
						.modifiers(modifiers)
						.author(author)
						.buildToChatMessage();
				responder.sendChatMessage(party, userMessage);	
			}
		}		
	}

	@Override
	public String getHandlerType() {
		return "chat-message";
	}

	@Override
	public boolean requiresRateLimit() {
		return false;
	}

}
