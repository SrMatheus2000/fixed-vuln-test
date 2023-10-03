line => {
            // Maximum length of target + message we can send to the IRC server is 500 characters
            // but we need to leave extra room for the sender prefix so the entire message can
            // be sent from the IRCd to the target without being truncated.
            let blocks = [
                ...lineBreak(line, {
                    bytes: this.options.message_max_length,
                    allowBreakingWords: true,
                    allowBreakingGraphemes: true,
                })
            ];

            blocks.forEach(block => this.raw(commandName, target, block));
        }