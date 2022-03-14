package main.java.de.voidtech.netflixparty.service;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

public class ConfigService {
	private static final Logger LOGGER = Logger.getLogger(ConfigService.class.getName());

	private final Properties config = new Properties();
	private boolean loadedSuccessfully;

	public ConfigService() {
		loadedSuccessfully = false;
		File configFile = new File("config.properties");
		if (configFile.exists()) {
			try (FileInputStream fis = new FileInputStream(configFile)){
				loadedSuccessfully = true;
				config.load(fis);
			} catch (IOException e) {
				LOGGER.log(Level.SEVERE, "an error has occurred while reading the config\n" + e.getMessage());
			}	
		} else {
			LOGGER.log(Level.SEVERE, "There is no config file. You need a file called config.properties at the root of the project!");
		}
	}
	
	public boolean configLoaded() {
		return loadedSuccessfully;
	}

	public String getHibernateDialect()
	{
		String dialect = config.getProperty("hibernate.Dialect");
		return dialect != null ? dialect : "org.hibernate.dialect.H2Dialect";
	}
	
	public String getDriver()
	{
		String driver = config.getProperty("hibernate.Driver");
		return driver != null ? driver : "org.h2.Driver";
	}
	
	public String getDBUser()
	{
		String user = config.getProperty("hibernate.User");
		return user != null ? user : "sa";
	}
	
	public String getDBPassword()
	{
		String pass = config.getProperty("hibernate.Password");
		return pass != null ? pass : "password";
	}
	
	public String getConnectionURL()
	{
		String dbURL = config.getProperty("hibernate.ConnectionURL");
		return dbURL != null ? dbURL : "jdbc:h2:mem:NetflixParty";
	}
	

	public String getHttpPort() {
		String port = config.getProperty("http.port");
		return port != null ? port : "6969";
	}
	
	public boolean textCacheEnabled() {
		String cacheEnabled = config.getProperty("cache.TextIsEnabled");
		return cacheEnabled != null ? Boolean.parseBoolean(cacheEnabled) : true;	
	}
	
	public boolean binaryCacheEnabled() {
		String cacheEnabled = config.getProperty("cache.BinaryIsEnabled");
		return cacheEnabled != null ? Boolean.parseBoolean(cacheEnabled) : true;	
	}
	
	
}