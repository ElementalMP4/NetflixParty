package main.java.de.voidtech.netflixparty.handlers;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.socket.WebSocketSession;

import main.java.de.voidtech.netflixparty.annotations.Handler;
import main.java.de.voidtech.netflixparty.entities.Party;
import main.java.de.voidtech.netflixparty.service.GatewayResponseService;
import main.java.de.voidtech.netflixparty.service.PartyService;

@Handler
public class CreatePartyHandler extends AbstractHandler{

	@Autowired
	private GatewayResponseService responder;
	
	@Autowired
	private PartyService partyService;
	
	@Override
	public void execute(WebSocketSession session, JSONObject data) {
		String roomThemeColour = data.getString("theme");
	
		Party party = new Party(partyService.generateRoomID(), roomThemeColour);
		partyService.saveParty(party);
		responder.sendSuccess(session, new JSONObject().put("roomID", party.getPartyID()), this.getHandlerType());
	}

	@Override
	public String getHandlerType() {
		return "create-party";
	}
	
	@Override
	public boolean requiresRateLimit() {
		return true;
	}
}