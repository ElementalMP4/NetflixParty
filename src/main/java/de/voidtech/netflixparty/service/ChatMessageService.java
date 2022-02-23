package main.java.de.voidtech.netflixparty.service;

import java.util.List;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import main.java.de.voidtech.netflixparty.entities.message.ChatMessage;


@Service
public class ChatMessageService {

	@Autowired
	private SessionFactory sessionFactory;
	
	public void saveMessage(ChatMessage message) {
		try(Session session = sessionFactory.openSession())
		{
			session.getTransaction().begin();			
			session.saveOrUpdate(message);
			session.getTransaction().commit();
		}
	}
	
	@SuppressWarnings("unchecked")
	public List<ChatMessage> getMessageHistory(String partyID) {
		try(Session session = sessionFactory.openSession())
		{
			List<ChatMessage> messages = (List<ChatMessage>) session.createQuery("FROM Messages WHERE partyID = :partyID")
                    .setParameter("partyID", partyID)
                    .list();
			return (List<ChatMessage>) messages;
		}
	}
}
