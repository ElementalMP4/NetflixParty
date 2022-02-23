package main.java.de.voidtech.netflixparty.handlers;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.socket.WebSocketSession;

import main.java.de.voidtech.netflixparty.annotations.Handler;
import main.java.de.voidtech.netflixparty.service.GatewayResponseService;

@Handler
public class PingHandler extends AbstractHandler {

	@Autowired
	private GatewayResponseService responder;
	
	@Override
	public void execute(WebSocketSession session, JSONObject data) {
		long startTime = data.getLong("start");
		
		JSONObject pingData = new JSONObject().put("start", startTime);
		
		responder.sendSuccess(session, pingData, getHandlerType());
	}

	@Override
	public String getHandlerType() {
		return "system-ping";
	}

	@Override
	public boolean requiresRateLimit() {
		return false;
	}

}
