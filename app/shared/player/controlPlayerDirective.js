app.directive('controlPlayer', function(Auth, routeRessource, $resource, $timeout) {
  return {
    restrict: 'E',
    templateUrl: "app/components/player/playerTemplate.html?t=000",
    link: function(scope, sce){


    	var Interactions = $resource(routeRessource.AddInteraction,{},
		{
			'save': {
			    method: 'POST',
			    headers: { 
			      "Authorization" : 'WSSE profile="UsernameToken"',
			      "X-wsse" : Auth.getUser().wsse
			    },
			    params:{iduser: "@iduser"}
			},
		});

    	var Types=$resource(routeRessource.GetTypes,{},
    	{
    		'query':{
    			method:'GET',
    			isArray: true,
    			headers: { 
			      "Authorization" : 'WSSE profile="UsernameToken"',
			      "X-wsse" : Auth.getUser().wsse
			    },
			    params:{iduser: "@iduser", iditem: "@iditem"}
    		},
    	});

		var Actions = $resource(routeRessource.AddAction,{},
		{
			'save': {
			    method: 'POST',
			    headers: { 
			      "Authorization" : 'WSSE profile="UsernameToken"',
			      "X-wsse" : Auth.getUser().wsse
			    },
			    params:{iduser: "@iduser"}
			},
		});
		scope.nextTrack = function(){
			if(scope.controller.random){
				var random = scope.controller.currentVideo;
				while(random == scope.controller.currentVideo){
					random = Math.floor(Math.random()*(scope.$root.playlist.length));
				}
				scope.controller.currentVideo = random;
			}
			else{
				if(scope.controller.currentVideo == scope.$root.playlist.length-1)
					scope.controller.currentVideo = 0
				else
					scope.controller.currentVideo++;
			}
			scope.controller.config.sources = scope.$root.playlist[scope.controller.currentVideo].sources;
			scope.controller.like = false;
			scope.controller.API.play();
			createInteraction(routeRessource.nextInteraction);
      		//scope.$root.createEcoute({"idItem" : scope.$root.playlist[scope.controller.currentVideo].id, "typeEcoute" : 0});


		};

		scope.previousTrack = function(){
			scope.controller.API.stop();
			if(scope.controller.random){
				var random = scope.controller.currentVideo;
				while(random == scope.controller.currentVideo){
					random = Math.floor(Math.random()*(scope.$root.playlist.length));
				}
				scope.controller.currentVideo = random;
			}
			else{
				if(scope.controller.currentVideo == 0)
					scope.controller.currentVideo = scope.$root.playlist.length-1;
				else
					scope.controller.currentVideo--;
			}
			scope.controller.config.sources = scope.$root.playlist[scope.controller.currentVideo].sources;
			scope.controller.like = false;
			scope.controller.API.play();
			createInteraction(routeRessource.previousInteraction);
      		//scope.$root.createEcoute({"idItem" : scope.$root.playlist[scope.controller.currentVideo].id, "typeEcoute" : 0});


		}; 

		scope.loop = function(){
			if(scope.controller.loop)
				scope.controller.loop = false;
			else{
				createInteraction(routeRessource.loopInteraction);
				scope.controller.loop = true;
			}
		};

		scope.random = function(){
			if(scope.controller.random)
				scope.controller.random = false;
			else{
				createInteraction(routeRessource.randomInteraction);
				scope.controller.random = true;
			}
		};

		scope.block = function(){
			if(scope.controller.block){
				scope.controller.block = false;
			}
			else{
				createInteraction(routeRessource.blockInteraction);
				createAction(routeRessource.blockAction, scope.$root.playlist[scope.controller.currentVideo].id);
				scope.nextTrack();
			}
		};

		scope.like = function(){
			if(scope.controller.like)
				scope.controller.like = false;
			else{
				createInteraction(routeRessource.likeInteraction);
				scope.controller.like = true;
			}
			
			createAction(routeRessource.likeAction, scope.$root.playlist[scope.controller.currentVideo].id);

		};

		scope.mute = function(){
			if(scope.controller.API.volume == 0)
				createInteraction(routeRessource.muteInteraction);
		}

		scope.pause = function(){
			console.log(scope.controller);
			if(scope.controller.API.currentState == "play"){
				createInteraction(routeRessource.playInteraction);
			}
			else
				createInteraction(routeRessource.stopInteraction);

		}


		var createInteraction = function(id){
			Interactions.save({iduser:Auth.getUser().id},{idInteraction : id})
		}	


		//Création d'une action (like, block, share)
		var createAction = function(idAction, idItem){
			Actions.save({iduser:Auth.getUser().id, idAction:idAction, idItem:idItem})
		}


		//Lorsqu'on va lancer un titre, launchPlay va faire un broadcast de l'événement
		//On fait un listener qui écoute et si l'événement se produit, on regarde si la chanson est bloquée/aimée/partagée
		scope.$on('someEvent', function(event, mass){ 
			scope.controller.like=false;
			Types.query({iduser:Auth.getUser().id, iditem:mass.id}, function(mess){
				for(var i in mess){
					if(mess[i][1] == 1){
						scope.controller.block=true;
					}
					else if(mess[i][1] == 2){
						scope.controller.like=true;
					}
				}
			});

			
		});

		

    },
    
  }
}) 