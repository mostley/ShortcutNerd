var game, currentApplicationHash;

function setCurrentApplication(applicationHash) {
	console.log("setCurrentApplication");

	var application = Applications[applicationHash];
	currentApplicationHash = applicationHash;
	game.start();

	$('#selectedApplication img.applicationicon').attr('src', application.img);
	$('#selectedApplication .title').html(application.title);
	$('#selectedApplication').show();
	$('#applicationSelector').hide();
	$('#homeNavigation').removeClass('active');
}

function getApplicationHash() {
	var result = null;
	var hash = window.location.hash;
	if (hash.length > 1) {
		result = hash.substr(1);
		if (!Applications[result]) {
			result = null;
		}
	}

	return result;
}

function locationUpdate(hash) {
    console.log('locationUpdate', getApplicationHash());

	var applicationHash = getApplicationHash();
	if (applicationHash) {
		if (applicationHash != currentApplicationHash) {
			setCurrentApplication(applicationHash);
		} else {
			// nothing
		}
	} else if (currentApplicationHash) {
		console.log("back to home -> reload");
		window.location.reload();
	}
}

$(function(){
	console.log("Startup");
	game = new Game('#gameContainer');

	$(window).on('hashchange', function(e){
	    locationUpdate();
	});

	locationUpdate();
});