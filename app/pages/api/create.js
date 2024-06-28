// pages/api/writeFile.js
import { log } from 'console';
import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { filename, content } = req.body;
    log(filename,content, "\n\n\n\n")

    // Ensure the directory exists
    // const dirPath = path.join(process.cwd(), 'data');
    // log(dirPath)
    // await fs.mkdir(dirPath, { recursive: true });

    // const filePath = path.join(dirPath, filename);
    const filePath = filename;

    try {
      await fs.writeFile(filePath, content);
      res.status(200).json({ message: 'File written successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error writing file', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}