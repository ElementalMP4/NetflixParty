package main.java.de.voidtech.netflixparty.handlers;

import org.json.JSONObject;
import org.springframework.web.socket.WebSocketSession;

public abstract class AbstractHandler {
	public abstract void execute(WebSocketSession session, JSONObject data);
	public abstract String getHandlerType();
	public abstract boolean requiresRateLimit();
}
