import fs from 'fs';
import path from 'path';
import { promisify } from 'util'; // This allows us to promisify fs functions
const unlinkAsync = promisify(fs.unlink); // Promisify the fs.unlink method

const deleteFile = async (file, folder) => {
  if (file && file.length > 0) {
    const filePath = path.join('uploads', folder, file.split('/').pop());
    try {
      await unlinkAsync(filePath);
    } catch (err) {
      console.error(`Error deleting photos: ${err.message}`);
    }
  }
};

export default deleteFile;
