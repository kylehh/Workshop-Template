// Get Parameters from some url
var getUrlParameter = function getUrlParameter(sPageURL) {
  var url = sPageURL.split('?');
  var obj = {};
  if (url.length == 2) {
    var sURLVariables = url[1].split('&'),
      sParameterName,
      i;
    for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split('=');
      obj[sParameterName[0]] = sParameterName[1];
    }
    return obj;
  } else {
    return undefined;
  }
};

// Execute actions on images generated from Markdown pages
var images = $("div#body-inner img").not(".inline");
// Wrap image inside a featherlight (to get a full size view in a popup)
images.wrap(function () {
  var image = $(this);
  if (!image.parent("a").length) {
    return "<a href='" + image[0].src + "' data-featherlight='image'></a>";
  }
});

// Change styles, depending on parameters set to the image
images.each(function (index) {
  var image = $(this)
  var o = getUrlParameter(image[0].src);
  if (typeof o !== "undefined") {
    var h = o["height"];
    var w = o["width"];
    var c = o["classes"];
    image.css("width", function () {
      if (typeof w !== "undefined") {
        return w;
      } else {
        return "auto";
      }
    });
    image.css("height", function () {
      if (typeof h !== "undefined") {
        return h;
      } else {
        return "auto";
      }
    });
    if (typeof c !== "undefined") {
      var classes = c.split(',');
      for (i = 0; i < classes.length; i++) {
        image.addClass(classes[i]);
      }
    }
  }
});

$(document).ready(function () {
  fixCodeTabs();
  restoreTabSelections();
});

// Stick the top to the top of the screen when  scrolling
$(document).ready(function () {
  $("#top-bar").sticky({ topSpacing: 0, zIndex: 1000 });
});


jQuery(document).ready(function () {
  // Add link button for every
  var text, clip = new ClipboardJS('.anchor');
  $("h1~h2,h1~h3,h1~h4,h1~h5,h1~h6").append(function (index, html) {
    var element = $(this);
    var url = encodeURI(document.location.origin + document.location.pathname);
    var link = url + "#" + element[0].id;
    return " <span class='anchor' data-clipboard-text='" + link + "'>" +
      "<i class='fas fa-link fa-lg'></i>" +
      "</span>"
      ;
  });

  $(".anchor").on('mouseleave', function (e) {
    $(this).attr('aria-label', null).removeClass('tooltipped tooltipped-s tooltipped-w');
  });

  clip.on('success', function (e) {
    e.clearSelection();
    $(e.trigger).attr('aria-label', 'Link copied to clipboard!').addClass('tooltipped tooltipped-s');
  });
  $('code.language-mermaid').each(function (index, element) {
    var content = $(element).html().replace(/&amp;/g, '&');
    $(element).parent().replaceWith('<div class="mermaid" align="center">' + content + '</div>');
  });
});

function fixCodeTabs() {
  /* if only a single code block is contained in the tab and no style was selected, treat it like style=code */
  var codeTabContents = Array.from(document.querySelectorAll('.tab-content.tab-panel-style')).filter(function (tabContent) {
    return tabContent.querySelector('*:scope > .tab-content-text > div.highlight:only-child, *:scope > .tab-content-text > pre.pre-code:only-child');
  });

  codeTabContents.forEach(function (tabContent) {
    var tabId = tabContent.dataset.tabItem;
    var tabPanel = tabContent.parentNode.parentNode;
    var tabButton = tabPanel.querySelector('.tab-nav-button.tab-panel-style[data-tab-item="' + tabId + '"]');
    if (tabContent.classList.contains('initial')) {
      tabButton.classList.remove('initial');
      tabButton.classList.add('code');
      tabContent.classList.remove('initial');
      tabContent.classList.add('code');
    }
    // mark code blocks for FF without :has()
    tabContent.classList.add('codify');
  });
}

function switchTab(tabGroup, tabId) {
  var tabs = Array.from(document.querySelectorAll('.tab-panel[data-tab-group="' + tabGroup + '"]')).filter(function (e) {
    return !!e.querySelector('[data-tab-item="' + tabId + '"]');
  });
  var allTabItems = tabs && tabs.reduce(function (a, e) {
    return a.concat(Array.from(e.querySelectorAll('[data-tab-item]')).filter(function (es) {
      return es.parentNode.parentNode == e;
    }));
  }, []);
  var targetTabItems = tabs && tabs.reduce(function (a, e) {
    return a.concat(Array.from(e.querySelectorAll('[data-tab-item="' + tabId + '"]')).filter(function (es) {
      return es.parentNode.parentNode == e;
    }));
  }, []);

  // if event is undefined then switchTab was called from restoreTabSelection
  // so it's not a button event and we don't need to safe the selction or
  // prevent page jump
  var isButtonEvent = event && event.target && event.target.getBoundingClientRect;
  if (isButtonEvent) {
    // save button position relative to viewport
    var yposButton = event.target.getBoundingClientRect().top;
  }

  allTabItems && allTabItems.forEach(function (e) { e.classList.remove('active'); });
  targetTabItems && targetTabItems.forEach(function (e) { e.classList.add('active'); });

  if (isButtonEvent) {
    // reset screen to the same position relative to clicked button to prevent page jump
    var yposButtonDiff = event.target.getBoundingClientRect().top - yposButton;
    window.scrollTo(window.scrollX, window.scrollY + yposButtonDiff);

    // Store the selection to make it persistent
    if (window.localStorage) {
      var selectionsJSON = window.localStorage.getItem(baseUriFull + "tab-selections");
      if (selectionsJSON) {
        var tabSelections = JSON.parse(selectionsJSON);
      } else {
        var tabSelections = {};
      }
      tabSelections[tabGroup] = tabId;
      window.localStorage.setItem(baseUriFull + "tab-selections", JSON.stringify(tabSelections));
    }
  }
}

function restoreTabSelections() {
  if (window.localStorage) {
    var selectionsJSON = window.localStorage.getItem(baseUriFull + "tab-selections");
    if (selectionsJSON) {
      var tabSelections = JSON.parse(selectionsJSON);
    } else {
      var tabSelections = {};
    }
    Object.keys(tabSelections).forEach(function (tabGroup) {
      var tabItem = tabSelections[tabGroup];
      switchTab(tabGroup, tabItem);
    });
  }
}
