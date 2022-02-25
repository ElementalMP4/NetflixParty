package main.java.de.voidtech.netflixparty.entities;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.json.JSONException;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import main.java.de.voidtech.netflixparty.entities.message.ChatMessage;
import main.java.de.voidtech.netflixparty.entities.message.MessageBuilder;
import main.java.de.voidtech.netflixparty.entities.message.SystemMessage;

public class Party {
	
	private String partyID; 
	private String roomColour;
	private List<WebSocketSession> sessions;
	private boolean hasBeenVisited;
	
	private static final Logger LOGGER = Logger.getLogger(Party.class.getName());
	
	public Party(String partyID, String roomColour) {
		this.partyID = partyID;
		this.roomColour = roomColour;
		this.sessions = new ArrayList<WebSocketSession>();
	}
	
	public String getPartyID() {
		return this.partyID;
	}
	
	public String getRoomColour() {
		return this.roomColour;
	}
	
	public List<WebSocketSession> getAllSessions() {
		return sessions;
	}
	
	public void addToSessions(WebSocketSession session) {
		if (!hasBeenVisited) hasBeenVisited = true;
		this.sessions.add(session);
	}
	
	public void removeFromSessions(WebSocketSession session) {
		this.sessions.remove(session);
	}
	
	public void checkRemoveSession(WebSocketSession session) {
		if (sessions.contains(session)) { 
			sessions.remove(session);
			
			ChatMessage leftMessage = new MessageBuilder()
					.author(MessageBuilder.SYSTEM_AUTHOR)
					.modifiers(MessageBuilder.SYSTEM_MODIFIERS)
					.colour(this.getRoomColour())
					.content("Someone has left the party!")
					.avatar(MessageBuilder.SYSTEM_AVATAR)
					.partyID(this.getPartyID())
					.buildToChatMessage();
			broadcastMessage(leftMessage);
		}
	}
	
	public boolean hasBeenVisited() {
		return this.hasBeenVisited;
	}
	
	public void broadcastMessage(SystemMessage message) {
		List<WebSocketSession> invalidSessions = new ArrayList<WebSocketSession>();
		for (WebSocketSession session : sessions) {
			if (session.isOpen()) sendMessage(message.convertToJson(), session);
			else invalidSessions.add(session);
		}
		if (!invalidSessions.isEmpty()) for (WebSocketSession session : invalidSessions) sessions.remove(session);
	}
	
	public void broadcastMessage(ChatMessage message) {
		List<WebSocketSession> invalidSessions = new ArrayList<WebSocketSession>();
		for (WebSocketSession session : sessions) {
			if (session.isOpen()) sendMessage(message.convertToJson(), session);
			else invalidSessions.add(session);
		}
		if (!invalidSessions.isEmpty()) for (WebSocketSession session : invalidSessions) sessions.remove(session);
	}
	
	public void sendMessage(String message, WebSocketSession session) {
		try {
			session.sendMessage(new TextMessage(message));
		} catch (JSONException | IOException e) {
			LOGGER.log(Level.SEVERE, "Error during Gateway Execution: " + e.getMessage());
		}
	}
}