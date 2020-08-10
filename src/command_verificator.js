const unbracket = require("unbracket");

const parseLongArguments = (command) => {
  return unbracket.unbracketWithBrackets(command);
};

const commandFormater = (req) => {
  let toParse = null;
  let command = null;
  let args = null;

  if (req.body.command !== undefined) {
    if (req.body.command.includes("[")) {
      const longArgument = parseLongArguments(req.body.command).join("");
      const replacement = new RegExp(longArgument);
      const rawReq = req.body.command.replace(replacement, "");
      toParse = rawReq
        .trim()
        .split(" ")
        .filter((arg) => arg.trim());
      command = toParse.shift();
      args = [longArgument, ...toParse.filter((i) => i !== "[]")];
    } else {
      toParse = req.body.command
        .trim()
        .split(" ")
        .filter((arg) => arg.trim());
      command = toParse.shift();
      args = toParse;
    }
    return { command, args };
  } else {
    return { command: undefined, args: undefined };
  }
};

const commandMatcher = ({ command }) => {
  const COMMANDS = [
    "ADD_TWEET",
    "DELETE_TWEET",
    "EDIT_TWEET",
    "VIEW_TWEETS",
    "FOLLOW",
    "UNFOLLOW",
    "PROFILE",
    "LOGIN",
    "REGISTER",
    "LIKE_TWEET",
    "DISLIKE_TWEET",
    "REPLY_TWEET",
    "RETWEET",
  ];

  const commandMatched = COMMANDS.filter(
    (match) => match === String(command).toUpperCase()
  ).join();

  if (commandMatched !== "") {
    return commandMatched;
  } else {
    return "Unrecognized command";
  }
};

const commandValidator = (command) => {
  if (command !== "Unrecognized command") {
    return true;
  } else {
    return false;
  }
};

const argumentValidator = ({ command, args }) => {
  const COMMANDS = {
    ADD_TWEET: 1,
    DELETE_TWEET: 1,
    EDIT_TWEET: 2,
    VIEW_TWEETS: 1,
    FOLLOW: 1,
    UNFOLLOW: 1,
    PROFILE: 1,
    LOGIN: 2,
    REGISTER: 4,
    LIKE_TWEET: 1,
    DISLIKE_TWEET: 1,
    REPLY_TWEET: 2,
    RETWEET: 2,
  };

  let validArgs = false;

  for (const commandMatched in COMMANDS) {
    if (String(command).toUpperCase() === commandMatched) {
      if (args.length === COMMANDS[commandMatched]) {
        validArgs = true;
      }
    }
  }

  return validArgs;
};

const getAction = (req) => {
  const action = commandFormater(req);
  const validCommand = commandValidator(commandMatcher(action));
  const validArguments = argumentValidator(action);

  if (validCommand) {
    if (validArguments) return action;
    else {
      return { args: "invalid arguments" };
    }
  } else {
    return { command: "invalid command" };
  }
};

const needsMiddleware = (req) => {
  const validation = getAction(req);

  if (validation.command !== "invalid command") {
    if (validation.args !== "invalid arguments") {
      if (
        validation.command.toLowerCase() === "login" ||
        validation.command.toLowerCase() === "register"
      ) {
        return false;
      } else {
        return true;
      }
    } else {
      return;
    }
  } else {
    return;
  }
};

module.exports = {
  getAction,
  needsMiddleware,
};
