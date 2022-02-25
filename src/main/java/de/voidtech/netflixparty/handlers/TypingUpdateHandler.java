package main.java.de.voidtech.netflixparty.handlers;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.socket.WebSocketSession;

import main.java.de.voidtech.netflixparty.annotations.Handler;
import main.java.de.voidtech.netflixparty.entities.Party;
import main.java.de.voidtech.netflixparty.entities.message.MessageBuilder;
import main.java.de.voidtech.netflixparty.service.GatewayResponseService;
import main.java.de.voidtech.netflixparty.service.PartyService;

@Handler
public class TypingUpdateHandler extends AbstractHandler {
	
	@Autowired
	private GatewayResponseService responder;
	
	@Autowired
	private PartyService partyService;
	
	@Override
	public void execute(WebSocketSession session, JSONObject data) {
		String roomID = data.getString("roomID");
		String mode = data.getString("mode");
		String user = data.getString("user");
				
		if (partyService.getParty(roomID) == null) responder.sendError(session, "Party does not exist", this.getHandlerType());
		else {
			Party party = partyService.getParty(roomID);
			if (!mode.equals("start") && !mode.equals("stop"))
				responder.sendError(session, "An invalid typing mode was provided", this.getHandlerType());
			else responder.sendSystemMessage(party, new MessageBuilder().type(this.getHandlerType()).data(new JSONObject()
					.put("mode", mode).put("user", user)).buildToSystemMessage());
		}	
	}

	@Override
	public String getHandlerType() {
		return "typing-update";
	}	
	
	@Override
	public boolean requiresRateLimit() {
		return false;
	}
}