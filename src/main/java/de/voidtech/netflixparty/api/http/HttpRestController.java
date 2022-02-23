package main.java.de.voidtech.netflixparty.api.http;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HttpRestController {
	
	@Autowired
	private ApplicationContext context;
	
	@RequestMapping(value = "/")
	public String indexRoute() {
		return "NetflixParty";
	}
	
	@RequestMapping(value = "/beansandthreads")
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