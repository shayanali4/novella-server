const express = require('express');
const router = express.Router();
const fs = require('fs');
const {
  CreateText,
  CreateDocx,
  CreateEpub,
  CreateHTML,
  CreateMD,
  CreatePDF,
  CreateRtf,
} = require('../writter/create');

/**
 * Get.
 */
router.get('/:id', async (req, res) => {
  let { params } = req;

  try {
    let path = `temp/${params.id}`;
    let isExists = fs.existsSync(path);

    if (!isExists) throw new Error('File not exists!');

    res.download(path, params.id, async () => await fs.unlinkSync(path));
  } catch (error) {
    res.download(`temp/error.txt`);
  }
});

/**
 * Posts.
 */
router.post('/', async (req, res) => {
  try {
    let { type, data } = req.body;
    let allowed = ['docx', 'odt', 'rtf', 'pdf', 'txt', 'epub', 'md', 'html'];

    // Files type is unknown
    if (!allowed.includes(type)) throw 'Unknown file type!';

    // Generate file
    let files;

    switch (type) {
      case 'docx':
        files = await CreateDocx(data);
        break;
      case 'epub':
        files = await CreateEpub(data);
        break;
      case 'md':
        files = await CreateMD(data);
        break;
      case 'pdf':
        files = await CreatePDF(data);
        break;
      case 'rtf':
        files = await CreateRtf(data);
        break;
        case 'html':
        files = await CreateHTML(data);
        break;
      default:
        files = await CreateText(data);
        break;
    }
    // Sending response
    res.send({ success: true, url: 'https://nevella-server.herokuapp.com' + '/api/files/' + files });
  } catch (error) {
    res.send({ success: false, error: error });
  }
});

/**
 * Module exports.
 */
module.exports = router;
