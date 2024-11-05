import multer from "multer";

export const FileMulter = multer({
  fileFilter: function (req: any, file: any, cb: any) {
    if (
      file.mimetype.split("/")[0] === "video" ||
      file.mimetype.split("/")[0] === "image"
    ) {
      cb(null, true);
    } else {
      cb(
        "Video file is not supported. Please upload a valid video file.",
        false
      );
    }
  },
  storage: multer.memoryStorage(),
});

// export const FileMulter = multer({
//   fileFilter: function (req: any, file: any, cb: any) {
//     if (
//       file.mimetype.split("/")[0] === "video" ||
//       file.mimetype.split("/")[0] === "image"
//     ) {
//       cb(null, true);
//     } else {
//       cb(
//         "Video file is not supported. Please upload a valid video file.",
//         false
//       );
//     }
//   },
//   storage: multer.memoryStorage(),
// });
