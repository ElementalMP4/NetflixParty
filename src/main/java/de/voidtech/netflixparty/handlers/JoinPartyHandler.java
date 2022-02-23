package main.java.de.voidtech.netflixparty.handlers;

import java.util.List;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.socket.WebSocketSession;

import main.java.de.voidtech.netflixparty.annotations.Handler;
import main.java.de.voidtech.netflixparty.entities.Party;
import main.java.de.voidtech.netflixparty.entities.message.ChatMessage;
import main.java.de.voidtech.netflixparty.entities.message.MessageBuilder;
import main.java.de.voidtech.netflixparty.service.ChatMessageService;
import main.java.de.voidtech.netflixparty.service.GatewayResponseService;
import main.java.de.voidtech.netflixparty.service.PartyService;

@Handler
public class JoinPartyHandler extends AbstractHandler{

	@Autowired
	private GatewayResponseService responder;
	
	@Autowired
	private PartyService partyService;
	
	@Autowired
	private ChatMessageService messageService;
	
	@Override
	public void execute(WebSocketSession session, JSONObject data) {
		String roomID = data.getString("roomID");
		String username = data.getString("username");
		
		if (partyService.getParty(roomID) == null) responder.sendError(session, "Party does not exist", this.getHandlerType());
			else {
				Party party = partyService.getParty(roomID);
				responder.sendSuccess(session, new JSONObject()
						.put("theme", party.getRoomColour()), this.getHandlerType());
				
				ChatMessage joinMessage = new MessageBuilder()
						.partyID(roomID)
						.author(MessageBuilder.SYSTEM_AUTHOR)
						.colour(party.getRoomColour())
						.content(String.format("%s has joined the party!", username))
						.modifiers(MessageBuilder.SYSTEM_MODIFIERS)
						.buildToChatMessage();
				party.addToSessions(session);
				deliverMessageHistory(session, roomID);
				responder.sendChatMessage(party, joinMessage);
			}
		}

	private void deliverMessageHistory(WebSocketSession session, String roomID) {
		List<ChatMessage> messageHistory = messageService.getMessageHistory(roomID);
		responder.sendChatHistory(session, messageHistory);
	}

	@Override
	public String getHandlerType() {
		return "join-party";
	}
	
	@Override
	public boolean requiresRateLimit() {
		return true;
	}
}