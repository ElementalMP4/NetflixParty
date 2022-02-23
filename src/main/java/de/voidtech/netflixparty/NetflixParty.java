package main.java.de.voidtech.netflixparty;

import java.util.Properties;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import main.java.de.voidtech.netflixparty.service.ConfigService;

@SpringBootApplication
public class NetflixParty {
	
	private static ConfigService configService;
	
	public static void main(String[] args) {
		SpringApplication springApp = new SpringApplication(NetflixParty.class);
		Properties properties = new Properties();
		
		configService = new ConfigService();
		if (configService.configLoaded()) {
			properties.put("server.port", configService.getHttpPort());
			properties.put("server.error.whitelabel.enabled", false);
			properties.put("server.error.path", "/error");

			properties.put("spring.datasource.url", configService.getConnectionURL());
			properties.put("spring.datasource.driverClassName", configService.getDriver());
			properties.put("spring.datasource.username", configService.getDBUser());
			properties.put("spring.datasource.password", configService.getDBPassword());
			properties.put("spring.jpa.database-platform", configService.getHibernateDialect());
			
			springApp.setDefaultProperties(properties);		
			springApp.run(args);	
		}
	}
	
	@Bean
	public ConfigService getConfigService() {
		return configService;
	}
}