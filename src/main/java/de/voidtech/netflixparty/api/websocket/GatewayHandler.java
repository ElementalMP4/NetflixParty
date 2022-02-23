package main.java.de.voidtech.netflixparty.api.websocket;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.AbstractWebSocketHandler;

import main.java.de.voidtech.netflixparty.service.MessageHandler;
import main.java.de.voidtech.netflixparty.service.PartyService;

@Component
public class GatewayHandler extends AbstractWebSocketHandler {
	
	@Autowired
	private MessageHandler messageHandler;
	
	@Autowired
	private PartyService partyService;
	
	@Override
	public void handleTextMessage(WebSocketSession socketSession, TextMessage message) throws Exception {
		messageHandler.handleMessage(socketSession, message.getPayload());			
	}

	@Override
	public void afterConnectionEstablished(WebSocketSession session) throws Exception {
		//Do absolutely nothing.
	}
	
	@Override
	public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
		partyService.removeSessionFromParty(session);
	}
}