package main.java.de.voidtech.netflixparty.entities.message;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Index;
import javax.persistence.Table;

import org.hibernate.annotations.Type;
import org.json.JSONObject;

@Entity(name = "Messages")
@Table(name = "Messages", indexes = @Index(columnList = "partyID", name = "index_message"))
public class ChatMessage {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;
	
	@Column
	private String partyID; 
	
	@Column
	private String author;
	
	@Column
	private String colour;
	
	@Column
	private String avatar;
	
	@Column
	@Type(type = "org.hibernate.type.TextType")
	private String content;
	
	@Column
	private String messageModifiers;
	
	@Deprecated
	ChatMessage() {
	}
	
	public ChatMessage(MessageBuilder builder)
	{
	  this.partyID = builder.getChatMessagePartyID();
	  this.author = builder.getChatMessageAuthor();
	  this.colour = builder.getChatMessageColour();
	  this.content = builder.getChatMessageContent();
	  this.messageModifiers = builder.getChatMessageMessageModifiers();
	  this.avatar = builder.getChatMessageAvatar();
	}

	public String convertToJson() {
		JSONObject data = new JSONObject().put("type", "chat-message")
				.put("data", new JSONObject()
						.put("author", this.author)
						.put("avatar", this.avatar)
						.put("colour", this.colour)
						.put("content", this.content)
						.put("modifiers", this.messageModifiers));
		return data.toString();
	}
}