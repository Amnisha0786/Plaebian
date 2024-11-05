import multer from 'multer';
import { nanoid } from 'nanoid';

export const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/');
    },
    filename: (req, file, cb) => {
        //check if original name has extension
        let extension = file.originalname.split('.').pop();
        if (!extension) {
            extension = req.file?.mimetype.split('/')[1];
        }
        cb(null, `${nanoid()}.${extension || 'mp4'}`);
    },
});
export const upload = multer({ storage, limits: { fieldSize: 25 * 1024 * 1024 } });
