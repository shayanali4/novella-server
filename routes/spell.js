const express = require('express');
const router = express.Router();
const SpellChecker = require('simple-spellchecker');

/**
 * Spell Check.
 */
router.post('/', async function (req, res) {
  SpellChecker.getDictionary('en-US', function (err, dictionary) {
    if (!err) {
      let body = req.body;
      let typo = [];

      for (let block of body.blocks) {
        let words = block.text
          .replace(/\s\s+/g, ' ')
          .replace(/\’/g, "'")
          .split(' ');
        let position = 0;

        for (let content of words) {
          let text = content;
          let hasCharacter = text
            .slice(-1)
            .toLowerCase()
            .replace(/[^a-z^A-Z]/g, '');

          if (!hasCharacter) {
            text = content.replace(/[^a-z^A-Z]|'’"/g, '');
          }

          let misspelled = !dictionary.spellCheck(text);

          if (text && misspelled && !body.whitelist.includes(text)) {
            let suggestions = dictionary
              .getSuggestions(text)
              .filter(t => t.length === text.length);

            typo.push({
              key: block.key,
              text: text,
              suggestions: suggestions,
              position: { start: position, end: position + text.length },
            });
          }

          position += content.length + 1;
        }
      }

      res.send({
        success: true,
        data: {
          synced: false,
          lists: typo,
          isOpenBox: true,
        },
      });
    } else {
      res.send({ success: false });
    }
  });
});

/**
 * Module exports.
 */
module.exports = router;
