(function() {
	//scoped globals for easy access in non init funcs
	var commandList = null;
	var optionsList = null;
	var previousCommand = null;
	var commandHistory = [];
	var commandHistoryCap = 0;
	var commandHistoryIndex = 0;
	var defaultCommands = {
		"list": [
			"'list' : lists all commands available in the console"
		],
		"minimize": [
			"'minimize' : shrinks the console window to the taskbar"
		],
		"maximize": [
			"'maximize' : expands the console window to its max dimensions"
		]
	}

	//*** CONSTRUCTOR ***
	this.Console = function() {
		this.terminal = null;
		this.inputBox = null;
		this.minimizeButton = null;

		var defaults = {
			consoleContainer: null,
			theme: "ntsc",
			introText: "[ -- Console.JS -- ]",
			instructionText: ":: Input 'list' for commands -- Append 'man' to a command for description ::",
			typingInterval: 50,
			consoleCaret: "// >",
			commandHistory: true,
			commandHistoryCap: 5,
			enableDefaultCommands: true,
			invalidCommandText: "command not recognized",
			commands: []
		}

		//check for user options
		if (arguments[0] && typeof arguments[0] === "object") {
			this.options = customSettings(defaults, arguments[0]);
		}
		else {
			this.options = defaults;
		}
	}

	//*** PRIVATE METHODS ***

	//extend default options
	function customSettings(source, properties) {
		var property;
		for (property in properties) {
			if (properties.hasOwnProperty(property)) {
				source[property] = properties[property];
			}
		}
		return source;
	}

	//buiid modal
	function createTerminal() {
		var base = document.createDocumentFragment();
		var introText,
			instructionText,
			inputContainer,
			historyContainer,
			historyScrollWrap;

		//create terminal countainer and add theme class
		this.terminal = document.createElement("div");
		this.terminal.id = "consoleJsTerminal";
		this.terminal.className = "console-js-terminal " + this.options.theme;

		//create terminal layout/base
		introText = document.createElement("p");
			introText.className = "intro-text";
			introText.innerHTML = this.options.introText;
			this.minimizeButton = document.createElement("a");
				this.minimizeButton.href = "#";
				this.minimizeButton.className = "minimize-button";
				this.minimizeButton.id = "minimizeButton";
				introText.appendChild(this.minimizeButton);
			this.terminal.appendChild(introText)

		instructionText = document.createElement("p");
			instructionText.className = "instruction-text";
			instructionText.innerHTML = this.options.instructionText;
			this.terminal.appendChild(instructionText);

		historyScrollWrap = document.createElement("div");
			historyScrollWrap.className = "terminal-history-scroll-wrap";
			historyContainer= document.createElement("div");
				historyContainer.id = "terminalHistoryContainer"
				historyContainer.className = "terminal-history-container";
				historyScrollWrap.appendChild(historyContainer);
			this.terminal.appendChild(historyScrollWrap);

		inputContainer = document.createElement("div");
			inputContainer.className = "terminal-input-container";
			inputContainer.innerHTML = "<label for='terminalInput' class='before'>" + this.options.consoleCaret + "</label>"
				this.inputBox = document.createElement("input");
				this.inputBox.type = "text";
				this.inputBox.id = "terminalInput"
				inputContainer.appendChild(this.inputBox);
			this.terminal.appendChild(inputContainer);

		base.appendChild(this.terminal);
		if(this.options.consoleContainer != null) {
			var insertInto = document.getElementById(this.options.consoleContainer);
			insertInto.appendChild(base)
		}
		else {
			document.body.appendChild(base);
		}

		//assign globals for easy access
		commandList = this.options.commands;
		optionsList = this.options;
		previousCommand = "";
		commandHistoryCap = this.options.commandHistoryCap;
	}

	//bind input for checking keycodes
	function attachInput() {
		this.inputBox.focus();
		this.inputBox.addEventListener('keyup', function(e) {
			var key = e.keyCode || e.which;

			//on enter with non empty string
			if ( key == 13 && this.value != "" ) {
				var userCommand = this.value.toLowerCase().trim();
				this.value = "";
				checkCommand(userCommand)
			}
			//on up arrow roll through history
			else if (key == 38) {
				this.value = commandHistory[commandHistoryIndex];
				if(commandHistoryIndex == 0) {
					commandHistoryIndex = commandHistory.length - 1;
				}
				else {
					commandHistoryIndex --;
				}
			}
			//on down arrow roll through history (opposite direction from arrow up)
			else if (key == 40) {
				this.value = commandHistory[commandHistoryIndex];
				if(commandHistoryIndex == commandHistory.length - 1) {
					commandHistoryIndex = 0;
				}
				else {
					commandHistoryIndex ++;
				}
			}
		});
	}

	//bind minimize button
	function attachMin() {
		var terminal = document.getElementById("consoleJsTerminal");
		this.minimizeButton.addEventListener('click', function(e) {
			e.preventDefault();
			if(terminal.classList.contains('minimize')) {
				terminal.classList.remove('minimize');
			}
			else {
				terminal.classList.add('minimize');
			}
		})
	}

	function checkCommand(userCommand) {
		var manReg = new RegExp(".* man$");
		var requestedMan = false;
		var manCommand = null;

		//is the user asking for the man page?
		if(manReg.test(userCommand)) {
			requestedMan = true;
			manCommand = userCommand;
			userCommand = userCommand.replace(" man", "");
		}

		//check if it matches default commands first
		if((userCommand == "list" || userCommand == "minimize" || userCommand == "maximize") && optionsList.enableDefaultCommands) {
			if(requestedMan) {
				respond(defaultCommands[userCommand].toString(), manCommand);
				return;
			}
			switch (userCommand) {
				case "list":
					listCommands();
					break;
				case "minimize":
					Console.prototype.minimize.call(this);
					respond(null, userCommand);
					break;
				case "maximize":
					Console.prototype.maximize.call(this);
					respond(null, userCommand);
					break;
			}
			updateHistory(userCommand);
			return;
		}
		//check against dev provided commands
		for (var i = 0, len = commandList.length; i < len; i++) {
			if( userCommand == commandList[i].command.toLowerCase() ) {
				if (requestedMan) {
					//return man page for command and skip any command init
					respond(commandList[i].description, manCommand)
					return;
				}
				//check requirement is met if command has requirement
				if( commandList[i].requires != null && previousCommand != commandList[i].requires ) {
					respond("another command is required first", userCommand);
					previousCommand = userCommand;
					updateHistory(userCommand);
					return;
				}
				runCommand(commandList[i].action);
				respond(commandList[i].response, userCommand);
				previousCommand = userCommand;
				updateHistory(userCommand);
				return;
			}
			else if (i == len - 1) {
				//rolled through all options, no match
				respond(optionsList.invalidCommandText, userCommand);
				updateHistory(userCommand);
				return;
			}
		}
	}

	function runCommand(action) {
		//run command in anon init wrapper
		var commandAction = new Function(action);
		commandAction();
	}

	function respond(responseText, commandText) {
		var terminalHistoryContainer = document.getElementById("terminalHistoryContainer");

		//print previous command if there was one
		if (commandText != null) {
			var oldCommand = document.createElement("p");
				oldCommand.className = "previous-command"
				oldCommand.innerHTML = optionsList.consoleCaret + " " + commandText;
				terminalHistoryContainer.appendChild(oldCommand);
		}

		//print response if there is one
		if (responseText != "" && responseText != null) {
			var responseLine = document.createElement("p");
				responseLine.className = "response";
				terminalHistoryContainer.appendChild(responseLine);
			updateScroll();

			var currentCharIndex = 0;
			//function for 'typing' effect
			function typeLine() {
				if( currentCharIndex >= responseText.length )
					return;
				var char = responseText[currentCharIndex];
				responseLine.innerHTML = responseLine.innerHTML + char;
				currentCharIndex ++;
				setTimeout(typeLine, optionsList.typingInterval)
			}
			typeLine();
		}
		else {
			updateScroll();
		}
	}

	function updateHistory(userCommand) {
		//limit command history to provided cap
		if(commandHistory.length >= commandHistoryCap)
			commandHistory.shift();

		commandHistory.push(userCommand);
		commandHistoryIndex = commandHistory.length - 1;
	}

	function updateScroll() {
		//scroll down so most recent command/response is visible
		setTimeout(function() {
			var el = document.getElementById("terminalHistoryContainer");
			el.scrollTop = el.scrollHeight;
		}, 5); //timeout to prevent miscroll
	}

	function listCommands() {
		var commandListText = "| ";
		if (optionsList.enableDefaultCommands) {
			for (var i = 0, len = Object.keys(defaultCommands).length; i < len; i++) {
				commandListText = commandListText + Object.keys(defaultCommands)[i] + " | ";
			}
		}
		for (var i = 0, len = commandList.length; i < len; i++) {
			commandListText = commandListText + commandList[i].command + " | ";
		}
		respond.call(this, commandListText, "list");
	}

	//*** PUBLIC METHODS ***
	Console.prototype.build = function() {
		createTerminal.call(this);
		attachInput.call(this);
		attachMin.call(this);
	}

	Console.prototype.maximize = function() {
		var terminal = document.getElementById("consoleJsTerminal");
		if(terminal.classList.contains("minimize"))
			terminal.classList.remove("minimize");
	}

	Console.prototype.minimize = function() {
		var terminal = document.getElementById("consoleJsTerminal");
		if(!terminal.classList.contains("minimize"))
			terminal.classList.add("minimize");
	}

	Console.prototype.pushCommand = function(newCommand) {
		if(typeof(newCommand) === "object") {
			for (var i = 0, len = commandList.length; i < len; i++) {
				if(newCommand.command.toLowerCase() == commandList[i].command.toLowerCase()) {
					console.log("pushNewCommand failed: command " + newCommand.command + " already exists");
					return;
				}
			}
			commandList.push(newCommand)
		}
		else {
			console.error("pushNewCommand failed: did not provide a valid command object");
		}
	}

	Console.prototype.removeCommand = function(removeThis) {
		for (var i = 0, len = commandList.length; i < len; i++) {
			if(removeThis.toLowerCase() == commandList[i].command.toLowerCase()) {
				var index = i;
				commandList.splice(index, 1)
				return;
			}
			else if (i == len - 1) {
				console.error("removeCommand failed: command " + removeThis + " does not exists");
				return;
			}
		}
	}

	Console.prototype.getCommands = function() {
		return commandList;
	}

	Console.prototype.clearHistory = function(includeCommandHistory) {
		var historyContainer = document.getElementById("terminalHistoryContainer");
		while (historyContainer.firstChild) {
			historyContainer.removeChild(historyContainer.firstChild);
		}
		if(includeCommandHistory)
			commandHistory = [];
	}

	Console.prototype.pushMessage = function(message) {
		respond(message, null);
	}

}());
