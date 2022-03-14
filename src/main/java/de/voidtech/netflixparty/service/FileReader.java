package main.java.de.voidtech.netflixparty.service;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FileReader {
	
	@Autowired
	private ConfigService config;
	
	private static final String FILE_BASE_URL = "www/";
	
	private static final Logger LOGGER = Logger.getLogger(FileReader.class.getName());
	
	private HashMap<String, String> textFileCache = new HashMap<String, String>();
	private HashMap<String, byte[]> binaryFileCache = new HashMap<String, byte[]>();
	
    private String readFile(String fileName) {
		try {
			byte[] contents = FileUtils.readFileToByteArray(new File(FILE_BASE_URL + fileName));
			LOGGER.log(Level.INFO, "Loaded text file '" + fileName + "'");
			return new String(contents, StandardCharsets.UTF_8);
		} catch (IOException e) {
			LOGGER.log(Level.SEVERE, "Error occurred during Service Execution: " + e.getMessage());
		}
		return null;
    }
    
    private byte[] readBinaryFile(String fileName) {
		try {
			byte[] contents = FileUtils.readFileToByteArray(new File(FILE_BASE_URL + fileName));
			LOGGER.log(Level.INFO, "Loaded binary file '" + fileName + "'");
			return contents;
		} catch (IOException e) {
			LOGGER.log(Level.SEVERE, "Error occurred during Service Execution: " + e.getMessage());
		}
		return null;
    }
    
    public String getTextFileContents(String fileName) {
    	if (config.textCacheEnabled()) {
    		if (!textFileCache.containsKey(fileName)) textFileCache.put(fileName, readFile(fileName));
        	return textFileCache.get(fileName);
    	} else return readFile(fileName);
    }

	public byte[] getBinaryFileContents(String fileName) {
		if (config.binaryCacheEnabled()) {
			if (!binaryFileCache.containsKey(fileName)) binaryFileCache.put(fileName, readBinaryFile(fileName));
	    	return binaryFileCache.get(fileName);	
		} else return readBinaryFile(fileName);
	}
}