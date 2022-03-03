package main.java.de.voidtech.netflixparty.api.http;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import main.java.de.voidtech.netflixparty.service.FileReader;

@RestController
public class HttpRestController {
	
	@Autowired
	private ApplicationContext context;
	
	@Autowired
	private FileReader fileReader;
	
	@RequestMapping(value = "/", produces = "text/html", method = RequestMethod.GET)
	public String indexRoute() {
		return fileReader.getTextFileContents("html/index.html");
	}
	
	@RequestMapping(value = "/join", produces = "text/html", method = RequestMethod.GET)
	public String joinRoute() {
		return fileReader.getTextFileContents("html/join.html");
	}
	
	@RequestMapping(value = "/avatar/{image}", produces = "image/png", method = RequestMethod.GET)
	public byte[] avatarRoute(@PathVariable String image) {
		return fileReader.getBinaryFileContents("/img/avatars/" + image + ".png");
	}
	
	@RequestMapping(value = "/beansandthreads", produces = "text/html", method = RequestMethod.GET)
	public String statsRoute() {
		Set<Thread> threadSet = Thread.getAllStackTraces().keySet();
		List<String> threadList = new ArrayList<String>();
		threadSet.forEach(thread -> {
			threadList.add(thread.getName()); 
		});
		String response =
		 "Thread Count: " + Thread.activeCount()
		 + "<br>Threads:<br>" + String.join("<br>", threadList)
		 + "<br><br>Bean Count: " + context.getBeanDefinitionCount()
		 + "<br>Beans:<br>" + String.join("<br>", context.getBeanDefinitionNames());
		return response;
	}
}