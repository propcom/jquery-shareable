
$.fn.shareable = function(opts){

	var opts = $.extend({
		onShare : function(){},
		onFail : function(){}
	}, opts);

	this.each(function(){

		var api = {},
			self = $(this);

		api.id = Math.round(Math.random() * 6000);

		api.permalink = function() {
			return self.find('input.permalink').val();
		};

		// Populates the share popup for the appropriate type
		api.populateShare = function(dropbox) {

			var type = dropbox.data('dropbox').type;
			var cont = $('<div class="dts-sharing-container" />'),
				textbox = $('<textarea id="dts-msg-' + api.id + '" class="dts-message-content" />'),
				submit = $('<input type="submit" id="dts-submit-' + api.id + '" class="dts-submit-message btn" />');

			submit.bind('click',function(e){
				e.preventDefault();
				$.ajax('/social/api/post.json',{
					'type' : 'post',
					'data' : {
						'post-to' : type,
						'message' : textbox.val(),
						'link' : api.short_url
					}
				}).success(function(data){
					cont.remove();
					$('.dts-popup').fadeOut();
					opts.onShare();
				}).error(function(data){
					opts.onFail();
				});
			});

			if(!api.short_url){

				$.ajax('/urlshorten/api/create_url.json',{
					'type' : 'post',
					'data' : {
						'url' : api.permalink()
					}
				}).success(function(data){
						textbox.val(textbox.val() + data.url);
						api.short_url = data.url;
					}).error(function(data){

					});

			} else {
				textbox.val(textbox.val() + api.short_url);
			}

			cont.append(textbox);
			cont.append(submit);
			dropbox.next().append(cont);

			if(type == 'both' || type == 'twitter'){
				textbox.attr('data-content',"Your message is too long to post to twitter!");
				textbox.attr('data-original-title',"Whoops...");
				textbox.popover({'trigger' : 'manual'});
				textbox.addClass('dts-twitter-post');
				textbox.charCount();
			}

		}

		self.data('shareable', api);

	});

	return this;

};

//$.fn.shareable.services.twitter = function(){};