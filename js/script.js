// date for countdown
startdate = "January 31, 2014 15:00:00";
// twitter username for @latest tweets
twitter_username = "PwegoCinema";
tweets_count = 5;
twitter_avatar_size = 32;
// time between animation frames the more the number, the slower clouds go
clouds_speed = 90;
cloud_step = 1;

jQuery(document).ready(function ($) {

  var $win = $(window), $clouds = $('#clouds'), $beasts = $('.beast');

  // twitter settings
  if ($.isFunction($.fn.tweet)) {
    $("#tweets_list").tweet({
      username: window.twitter_username,
      avatar_size: window.twitter_avatar_size,
      count: window.tweets_count,
      loading_text: "loading tweets...",
      template: '{avatar} {text}{time}'
    });
  }
  // photo lightbox settings
  if ($.isFunction($.fn.prettyPhoto)) {
    $("a[data-rel^='prettyPhoto']").prettyPhoto({deeplinking: false, overlay_gallery: false});
  }

  // preloading of images
  var preload = ["clouds.png", "beasts.png", "grass.png", "grass_bg1.png", "mountains1.png", "mountains2.png",
                 "mountains3.png"];

  // init all movements when images are loaded
  $win.on('init.elustro', function () {
    $('#preloader').remove();
    $('#content-container').show();
    initBeasts();
    initClouds();
  });

  var promises = [];
  for (i = 0; i < preload.length; i++) {
    (function (url, promise) {
      var img = new Image();
      img = new Image();
      img.onload = function () {
        promise.resolve();
      };
      img.src = 'img/' + url;
    })(preload[i], promises[i] = $.Deferred());
  }
  $.when.apply($, promises).done(function () {
    $win.trigger('init.elustro');
  });

  function initBeasts() {
    $beasts.each(function () {
      var self = $(this);

      self.data('beast-height', self.height());
    });
    // release the beast!
    moveBeast($beasts.eq(0), 1);
  }

  function moveBeast($beast, direction) {
    // vars for hiding the beast
    var targetPosition = $beast.data('beast-height'), speed = getRandomInt(200,
      500), bg_hor_offset = get_bg_offset($beast);

    if ($win.data('beast-timeout')) {
      clearTimeout($win.data('beast-timeout'));
    }

    // set vars for rising of the beast
    if (direction) {
      var screenWidth = $win.width();
      // hide current
      $beast.hide();
      // choose the other beast
      $beast = $beasts.not($beast);
      $beast.show();
      // here we choose the beast pic
      var positions = ['0%', '25%', '50%', '75%'], temp = bg_hor_offset;
      // make sure no beast get loaded twice
      while (temp == bg_hor_offset) {
        bg_hor_offset = positions[getRandomInt(0, 3)];
      }

      //set random horizontal position on screen
      var beast_left_offset = getRandomInt(screenWidth * .2, screenWidth * .8);
      // target position for rising is zero
      targetPosition = 0;
      speed = 4000;

      //hide the beast and move him horizontally
      $beast.css({'background-position': bg_hor_offset + ' ' + $beast.data('beast-height')
        + 'px', 'left': beast_left_offset});
    }
    $beast.animate({'background-position': bg_hor_offset + ' ' + targetPosition + 'px'}, speed);

    // rerun animation after 1-2 seconds
    $win.data('beast-timeout', setTimeout(function () {
      moveBeast($beast, !direction)
    }, getRandomInt(700, 2000) + speed));
  }


  function initClouds() {
    if ($clouds.data('el-interval')) {
      clearInterval($clouds.data('el-interval'));
    }
    $clouds.data('curpos', 0).data('el-interval', setInterval(moveClouds, window.clouds_speed));
  }

  function moveClouds() {
    var cur_pos = $clouds.data('curpos');
    cur_pos -= window.cloud_step;
    if (cur_pos < -1150) {
      cur_pos = 0;
    }
    // move the background with backgrond-position css properties
    $clouds.css("backgroundPosition", cur_pos + "px 0").data('curpos', cur_pos);
  }

  // initing countdown on fake tmer, that is not visible. it updates the real timer
  if ($.isFunction($.fn.countdown)) {
    $('#fake_timer').countdown({until: new Date(window.startdate), compact: true, onTick: updateTimer});
  }

  // update the real timer
  function updateTimer(time) {
    time.splice(0, 3);
    var ar = [];
    $.each(time, function (k, v) {
      ar.push(v.toString())
    });

    var nums = [];
    $.each(ar, function (k, v) {
      switch (k) {
        case 0: // days
          while (v.length < 3) {
            v = '0' + v;
          }
          break;
        default:
          while (v.length < 2) {
            v = '0' + v;
          }
      }

      $.each(v, function (key, val) {
        nums.push(val)
      });
    });

    $('#countdown .digit').each(function (k) {
      var obj = $(this).find('span');
      // no need to change the digit
      if (obj.eq(0).text() == nums[k]) {
        return true;
      }
      /** Animate numbers **/
      obj.eq(1).text(nums[k]).animate({opacity: 1});
      obj.eq(0).animate({'margin-top': -45, opacity: 0}, 960, function () {
        var parent = $(this).parent();
        $(this).remove();
        $('<span/>').css({opacity: 0}).appendTo(parent);
      });
    });
  }

  // returns horizontal value of CSS background-position (for beasts)
  function get_bg_offset($obj) {
    var bgpos = $obj.css('background-position');
    if (!bgpos) {
      return 0;
    }
    return bgpos.split(' ')[0];
  }

  /**
   * Returns a random integer between min and max
   * Using Math.round() will give you a non-uniform distribution!
   */
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }


  /** 404 page scripts **/
  var $container = $('#content-container'), mountains = $('.mountains3');

  function updateCloudsHeight() {
    if ($win.height() > 640) {
      var delta = $win.height() - $container.height();

      var mntMargin = parseInt(mountains.css('margin-top')), cloudsMargin = parseInt($clouds.css('top')) || 0;
      mountains.css('margin-top', (mntMargin + delta) + 'px');
      $clouds.css('top', (cloudsMargin + delta) + 'px');
    }
  }

  if ($('body').hasClass('page-404')) {
    $win.on('resize.elustro ready', updateCloudsHeight);
  }

});
