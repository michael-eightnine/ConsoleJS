# consoleJS
Vanilla JavaScript plugin for building an old-school console interface that runs custom defined commands and actions.

Currently comes with 2 themes, and the ability to create your own via the source SCSS files or via the "unstyled" attribute.

- No dependencies!
- 1.9KB minified and Gzipped
- Brought to you by [Michael Smith](http://www.eightnine.co/smith)

## 1. Getting Started

### 1.1. Installation

The recommended way to get up and running with consoleJS is to load the consoleJS script before your closing `</body>` tag.

```html
<script src="path/to/script/console.min.js"></script>
<script src="path/to/script/intializationScript.js"></script>
```

**Please note:** the script you use to initialize your console must be after the plugin script import.

### 1.2. Basics

When declaring your console, pass any configurations to apply them to the instance. It is highly recommended to add custom commands, even if you're using the default values for the other options.

```js
var myConsole = new Console(options);
```

After your console is declared, it's ready to be initialized via the 'build()' method/

```js
myConsole.build();
```

### 1.3. Quick Example

A quick example of declaring and initializing a consoleJS instance might look like this:

```js
var myConsole = new Console({
	introText: "My Example Console",
	instructionText: "Type 'list' to see the all of the available commands",
	commandHistory: false,
	commands: [
		{
			command: "custom command",
			action: "alert('command successful!')",
			description: "'custom command' : generates an alert",
			response: "hey user, you ran the command",
			requires: null
		}
	]
})

myConsole.build()
```

Running the code above would generate a new consoleJS instance that accepts the command "custom command". When submitted it would generate the alert, and write the response "hey user, you ran the command" to the console.



## 2. Configuration

### 2.1. Default Options
```js
// Accepts the ID of a DOM element for the console to be created within, if 'null' appends console to the document's body
consoleContainer: null,

// Theme options: "ntsc", "windows95". Pass a different class name to build your own theme or pass "unstyled" to remove all default styling
theme: "ntsc"

// Accepts any string - this is the "header" text on the console window
introText: "[ -- ConsoleJS -- ]",

// Accepts any string - this is the text directly below introText
instructionText: ":: Input 'list' for commands -- Append 'man' to a command for description ::",

// Accepts any string - shorter strings are recommended
consoleCaret: "// >",

// Accepts any string - this text is shown to the user when they have entered an invalid command
invalidCommandText: "command not recognized",

// Accepts an integer - this is the amount of delay (in milliseconds) used when typing responses to the user
typingInterval: 50,

// Accepts a boolean - if true allows users to use the up and down arrow keys to select previously inputted commands
commandHistory: true,

//Accepts an integer - number of commands to save in the command history (only useful if commandHistory is true)
commandHistoryCap: 5,

//Accepts a boolean - set to false to disabled the default commands of "list", "minimize", and "maximize"
enableDefaultCommands: true,

//Accepts an array of command objects - this is where you place the actions and commands of your console
commands: []

```

### 2.2. Building Custom Commands (The Command Object)

The last option listed above is "commands" which is blank by default. This is where you can add in the commands that make your console usable.

An example of a command declaration, with all of the available options, is as follows:

```js
commands: [
	{
		// Accepts a string - this is what the user will type in to access your command
		command: "name of your command",

		// Accepts a function - this is the action you wish to perform when the user runs the command
		action: "exampleFunction()",

		// Accepts a string - this will print when your use requests the man page for this command
		description: "a description of what your command does and any other useful information",

		// Accepts a string - this is what the console will respond to the user with - leave blank for no response
		response: "hey, you ran the command"

		// Accepts the name of another custom command - indicates the "requires" command must be run prior to running this command
		requires: "previous command"
	}
]
```

## 3. Working with your Console

### 3.1. Public Methods

consoleJS offers a variety of public methods to help your customize your user's interaction with a custom console. These are listed below along with their arguments and function.

These are all described using this context:
```js
var myConsole = new Console(options);
```

##### `myConsole.build()`

Initializes your console object, this is required to run any other functions.

##### `myConsole.getCommands()`

Returns all of the commands currently available in the console.

##### `myConsole.pushCommand(commandObject)`

Adds a new command defined by a `commandObject`. (as seen in section 2.2.)

##### `myConsole.removeCommand(commandName)`

Removes a command whose name matches the string `commandName`.

##### `myConsole.clearHistory(includeCommandHistory)`

Clears the console history visible to the user. If `includeCommandHistory` is set to true it will also remove the previous commands avaiable via the arrow keys.

##### `myConsole.pushMessage(message)`

Prints the passed string to the console.

##### `myConsole.minimize()`

Minimizes the console window (assuming it isn't already)

##### `myConsole.maximize()`

Maximizes the console window (assuming it isn't already)
