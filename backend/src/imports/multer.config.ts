import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { BadRequestException } from '@nestjs/common';

export const multerConfig: MulterOptions = {
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, callback) => {
    if (!file.originalname.match(/\.(xlsx|xls)$/)) {
      return callback(
        new BadRequestException('Только Excel файлы (.xlsx, .xls) разрешены'),
        false,
      );
    }
    callback(null, true);
  },
};
