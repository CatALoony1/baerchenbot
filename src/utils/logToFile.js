const fs = require('fs');
require('dotenv').config();
const install_hook_to = function (obj) {
  if (obj.hook || obj.unhook) {
    throw new Error('Object already has properties hook and/or unhook');
  }

  obj.hook = function (_meth_name, _fn, _is_async) {
    let self = this,
      meth_ref;

    // Make sure method exists
    if (
      Object.prototype.toString.call(self[_meth_name]) !== '[object Function]'
    ) {
      throw new Error('Invalid method: ' + _meth_name);
    }

    // We should not hook a hook
    if (self.unhook.methods[_meth_name]) {
      throw new Error('Method already hooked: ' + _meth_name);
    }

    // Reference default method
    meth_ref = self.unhook.methods[_meth_name] = self[_meth_name];

    self[_meth_name] = function () {
      const args = Array.prototype.slice.call(arguments);

      // Our hook should take the same number of arguments
      // as the original method so we must fill with undefined
      // optional args not provided in the call
      while (args.length < meth_ref.length) {
        args.push(undefined);
      }

      // Last argument is always original method call
      args.push(function () {
        const args = arguments;

        if (_is_async) {
          process.nextTick(function () {
            meth_ref.apply(self, args);
          });
        } else {
          meth_ref.apply(self, args);
        }
      });

      _fn.apply(self, args);
    };
  };

  obj.unhook = function (_meth_name) {
    let self = this,
      ref = self.unhook.methods[_meth_name];

    if (ref) {
      self[_meth_name] = self.unhook.methods[_meth_name];
      delete self.unhook.methods[_meth_name];
    } else {
      throw new Error('Method not hooked: ' + _meth_name);
    }
  };

  obj.unhook.methods = {};
};

module.exports = {
  run: async (client) => {
    const stdout = process.stdout;
    install_hook_to(stdout);
    stdout.hook(
      'write',
      async function (string) {
        const targetChannel = await client.channels.fetch(process.env.LOG_ID);
        let d = new Date();
        string = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}T${d.getHours()}:${d.getMinutes()}:${d.getSeconds()},${d.getMilliseconds()}|${string}`;
        await fs.appendFile('./logs/bot._log', string, function (err) {
          if (err) throw err;
        });
        const logFile = './logs/bot._log';
        const fileAttachments = fs.existsSync(logFile) ? [logFile] : [];
        if (string.includes('connect ECONNREFUSED')) {
          await targetChannel.send({
            content: `DB connection ERROR <@${process.env.ADMIN_ID}> please check DB`,
            files: fileAttachments,
          });
        } else if (string.toLowerCase().includes('error')) {
          await targetChannel.send({
            content: `ERROR <@${process.env.ADMIN_ID}> please check log`,
            files: fileAttachments,
          });
        }
      },
      true,
    );
  },
};
