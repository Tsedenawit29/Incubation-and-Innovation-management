package com.iims.iims.meeting.util;

import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import java.security.SecureRandom;
import java.util.Base64;

@Component
public class TokenEncryptor {

    // AES key (use env var or config in production)
    private static final String SECRET_KEY = "ReplaceThisWithYourSecretKey123"; // 24+ chars ideally
    private static final String AES = "AES";
    private static final String AES_GCM_NO_PADDING = "AES/GCM/NoPadding";
    private static final int GCM_TAG_LENGTH = 128;

    // Initialization vector size for GCM
    private static final int IV_SIZE = 12;

    public String encrypt(String plainText) {
    try {
        byte[] iv = new byte[IV_SIZE];
        SecureRandom random = new SecureRandom();   // Use this instead
        random.nextBytes(iv);

        Cipher cipher = Cipher.getInstance(AES_GCM_NO_PADDING);
        SecretKey key = new SecretKeySpec(SECRET_KEY.getBytes(), AES);
        GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
        cipher.init(Cipher.ENCRYPT_MODE, key, spec);

        byte[] encrypted = cipher.doFinal(plainText.getBytes());

        byte[] encryptedWithIv = new byte[IV_SIZE + encrypted.length];
        System.arraycopy(iv, 0, encryptedWithIv, 0, IV_SIZE);
        System.arraycopy(encrypted, 0, encryptedWithIv, IV_SIZE, encrypted.length);

        return Base64.getEncoder().encodeToString(encryptedWithIv);
    } catch (Exception e) {
        throw new RuntimeException("Error encrypting token", e);
    }
}
    public String decrypt(String cipherText) {
        try {
            byte[] decoded = Base64.getDecoder().decode(cipherText);
            byte[] iv = new byte[IV_SIZE];
            System.arraycopy(decoded, 0, iv, 0, IV_SIZE);

            byte[] encrypted = new byte[decoded.length - IV_SIZE];
            System.arraycopy(decoded, IV_SIZE, encrypted, 0, encrypted.length);

            Cipher cipher = Cipher.getInstance(AES_GCM_NO_PADDING);
            SecretKey key = new SecretKeySpec(SECRET_KEY.getBytes(), AES);
            GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, key, spec);

            byte[] decrypted = cipher.doFinal(encrypted);
            return new String(decrypted);
        } catch (Exception e) {
            throw new RuntimeException("Error decrypting token", e);
        }
    }
}
