// Using Web Crypto API for secure password hashing
export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  
  // Generate a random salt
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  // Hash the password with salt
  const hashBuffer = await crypto.subtle.digest(
    'SHA-256',
    new Uint8Array([...salt, ...data])
  );
  
  // Convert to base64 string with salt
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const saltArray = Array.from(salt);
  const hashHex = [...saltArray, ...hashArray]
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return hashHex;
};

export const verifyPassword = async (password: string, storedHash: string): Promise<boolean> => {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    
    // Extract salt from stored hash
    const hashBytes = storedHash.match(/.{2}/g)?.map(hex => parseInt(hex, 16)) || [];
    const salt = new Uint8Array(hashBytes.slice(0, 16));
    const storedHashPart = hashBytes.slice(16);
    
    // Hash the password with extracted salt
    const hashBuffer = await crypto.subtle.digest(
      'SHA-256',
      new Uint8Array([...salt, ...data])
    );
    
    // Compare hashes
    const newHashArray = Array.from(new Uint8Array(hashBuffer));
    return newHashArray.every((byte, i) => byte === storedHashPart[i]);
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}; 