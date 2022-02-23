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
public class VideoPauseHandler extends AbstractHandler {

	@Autowired
	private GatewayResponseService responder;
	
	@Autowired
	private PartyService partyService;
	
	@Override
	public void execute(WebSocketSession session, JSONObject data) {
		String roomID = data.getString("roomID");

		if (partyService.getParty(roomID) == null) responder.sendError(session, "Party does not exist", this.getHandlerType());
		else {
			Party party = partyService.getParty(roomID);
			responder.sendSystemMessage(party, new MessageBuilder().type("pausevideo").data(MessageBuilder.EMPTY_JSON).buildToSystemMessage());
		}
	}

	@Override
	public String getHandlerType() {
		return "pause-video";
	}
	
	@Override
	public boolean requiresRateLimit() {
		return false;
	}
}