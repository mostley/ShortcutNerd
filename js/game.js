var Game = function(gameContainerSelector) {
	var me = this;

	me.gameContainer = $(gameContainerSelector);
	me.currentShortcut = null;
	me.pressedCombinations = [];
	me.currentCombinationIndex = 0;
	me.lastKey = null;
	me.expectInput = false;


	$(document).on('keydown', me.onKeyDown.bind(me));

	$(document).on('keyup', me.onKeyUp.bind(me));
};

Game.prototype = {
	start: function() {
		var me = this;

		me.gameContainer.show();

		var shortcut = me.getRandomShortcut();
		me.showShortcut(shortcut);
	},

	getRandomShortcut: function(shortcut) {
		var shortcuts = Applications[currentApplicationHash].shortcuts;

		return shortcuts[Math.floor(Math.random() * shortcuts.length)];
	},

	showShortcut: function(shortcut) {
		var me = this;

		console.log("shotShortcut", shortcut);

		me.currentShortcut = shortcut;

		$('#questionContainer .hint img').attr('src', shortcut.img);
		$('#questionContainer .text').text(shortcut.name);

		me.pressedCombinations = [];
		me.currentCombinationIndex = 0;
		$('#wrongNotification').hide();
		$('#correctNotification').hide();

		me.expectInput = true;
		$('#pressShortcutNotification').show();
		$('#pressEnterNotification').hide();

		$('.solutioncontainer').hide();

		$('#shortcutVisualizer').text('').removeClass('wrong').removeClass('correct');
	},

	onKeyDown: function(e) {
		var me = this;

		if (!me.expectInput) { return; }

		e.preventDefault();
		e.stopPropagation();

		if (me.lastKey == e.keyCode) { return; }

		if (e.keyCode == k_.CTRL || e.keyCode == k_.CTRLRIGHT || e.keyCode == k_.SHIFT || e.keyCode == k_.ALT || e.keyCode == k_.ALTRIGHT) {
			return;
		}

		if (e.ctrlKey) {
			$('#shortcutVisualizer').append(me.visualizeKey(k_.CTRL) + "-");
		}
		if (e.shiftKey) {
			$('#shortcutVisualizer').append(me.visualizeKey(k_.SHIFT) + "-");
		}
		if (e.altKey) {
			$('#shortcutVisualizer').append(me.visualizeKey(k_.ALT) + "-");
		}
		$('#shortcutVisualizer').append(me.visualizeKey(e.keyCode) + "-" );

		me.lastKey = e.keyCode;
	},

	onKeyUp: function(e) {
		var me = this;

		if (!me.expectInput) {
			if (e.keyCode == k_.RETURN) {
				var shortcut = me.getRandomShortcut();
				me.showShortcut(shortcut);
			}
			return;
		}
		if (me.lastKey == null) { return; }
		
		e.preventDefault();
		e.stopPropagation();

		if (me.lastKey == e.keyCode) { 
			me.lastKey = null;
		}

		if (e.keyCode == k_.CTRL || e.keyCode == k_.CTRLRIGHT || e.keyCode == k_.SHIFT || e.keyCode == k_.ALT || e.keyCode == k_.ALTRIGHT) {
			return;
		}

		var text = $('#shortcutVisualizer').text();
		$('#shortcutVisualizer').text(text.substr(0, text.length-1));

		me.currentCombinationIndex += 1;
		var combination = [];
		if (e.ctrlKey) {
			combination.push(k_.CTRL);
		}
		if (e.shiftKey) {
			combination.push(k_.SHIFT);
		}
		if (e.altKey) {
			combination.push(k_.ALT);
		}
		combination.push(e.keyCode);
		me.pressedCombinations.push(combination);

		$('#shortcutVisualizer').append(" + " );

		var combinationLengths = [me.currentShortcut.keys.length];

		for (var i in me.currentShortcut.alternatives) {
			var keys = me.currentShortcut.alternatives[i];
			combinationLengths.push(keys.length);
		}

		var maxLength = Math.max.apply(Math, combinationLengths);

		console.log(me.currentCombinationIndex, combinationLengths);
		if (me.currentCombinationIndex > maxLength) {
			console.log("over max length");
			me.setWrong();
		} else if ($.inArray(me.currentCombinationIndex, combinationLengths) >= 0) {
			console.log("at least one is right length");
			
			if (me.isCorrect(me.currentShortcut.keys, me.pressedCombinations)) {
				me.setCorrect();
			} else {
				console.log("perhaps an alternative?");

				var wasCorrect = false;

				for (var i in me.currentShortcut.alternatives) {
					var keys = me.currentShortcut.alternatives[i];
					console.log("isCorrect?",keys,me.pressedCombinations);
					if (me.isCorrect(keys, me.pressedCombinations)) {
						me.setCorrect();
						wasCorrect = true;
						break;
					}
				}

				if (!wasCorrect && !me.stillHasAlternative(me.currentCombinationIndex, combinationLengths)) {
					me.setWrong();
				} else {
					console.log("still one to go");
				}
			}
		}
	},

	stillHasAlternative: function(index, lengths) {
		var result = false;

		for (var i in lengths) {
			if (lengths[i] > index) {
				 result = true;
				 break;
			}
		}

		return result;
	},

	isCorrect: function(keys, pressed_keys) {
		var me = this;

		var correct = true;

		for (var i in keys) {
			var expectedCombination = keys[i];
			var actualCombination = pressed_keys[i];

			for (var j in actualCombination) {
				var keyCode = actualCombination[j];

				if ($.inArray(keyCode, expectedCombination) < 0) {
					correct = false;
					break;
				}
			}

			if (!correct) { break; }
		}

		return correct;
	},

	setWrong: function() {
		var me = this;

		$('#wrongNotification').css('display', 'inline-block');
		$('.solutioncontainer').show();
		$('#solutionVisualizer').text(me.visualizeKeys(me.currentShortcut.keys));

		$('#shortcutVisualizer').addClass('wrong');

		me.onAfterResultEntered();
	},

	setCorrect: function() {
		var me = this;

		$('#correctNotification').css('display', 'inline-block');

		$('#shortcutVisualizer').addClass('correct');

		me.onAfterResultEntered();
	},

	onAfterResultEntered: function() {
		var me = this;

		me.expectInput = false;

		var text = $('#shortcutVisualizer').text();
		$('#shortcutVisualizer').text(text.substr(0, text.length-3));

		$('#pressShortcutNotification').hide();
		$('#pressEnterNotification').show();
	},

	visualizeKeys: function(keys) {
		var me = this;

		var result = "";

		for (var i=0; i<keys.length; i++) {
			var combination = keys[i];
			
			for (var j=0; j<combination.length; j++) {
				result += me.visualizeKey(combination[j]);
				if (j != combination.length-1) {
					result += "-";
				}
			}

			if (i != keys.length-1) {
				result += " + ";
			}
		}

		return result;
	},

	visualizeKey: function(key) {
		return "[" + keyNames[key] + "]";
	}
};