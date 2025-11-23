import bcrypt from 'bcrypt';

/**
 * Hash password bằng bcrypt
 */
export const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * So sánh password với hash
 */
export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};
