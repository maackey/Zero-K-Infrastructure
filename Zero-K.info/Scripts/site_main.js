﻿
var isBusy = 0;
var ajaxScrollCount = 40;
var ajaxScrollOffset = 40;
var ajaxScrollEnabled = true;


(function ($) {
    /**
     * returns object with url variables
     * hash parameters take precedence over search
     * parameters
     * @return {Object}
     */
    $.getUrlVars = function () {
        var loc = document.location,
            search = loc.search.replace('?', '').split('&'),
            hash = loc.hash.replace('#', '').split('&'),
            i, l, v, vars = {};

        for (i = 0, l = search.length; i < l; i++) {
            v = search[i].split('=');
            vars[v[0]] = v[1];
        }

        for (i = 0, l = hash.length; i < l; i++) {
            v = hash[i].split('=');
            vars[v[0]] = v[1];
        }

        return vars;
    }

    /**
     * returns a single value from the getUrlVars hash
     * @param {String} i The hash index
     * @return {String}
     */
    $.getUrlVar = function (i) {
        return $.getUrlVars()[i];
    };
}(jQuery));


function DynDialog(url, title) {
    $.get(url, function(data) {
        var t = $("<div></div>");
        t.html(data);
        t.appendTo(document.body);
        GlobalPageInit(t);
        t.dialog(
        {
            autoOpen: true,
            show: "fade",
            hide: "fade",
            modal: false,
            title: title,
            width: 800,
            maxHeight: 600,
            open: function () {
                setTimeout(function() {
                    $('.js_dialog').scrollTop(0);
                }, 500);
           },
            buttons: { "Close": function() { $(this).dialog("close"); } }
        });
    });
}

function ReplaceHistory(params) {
    // replace # is a hack for IE
    var res = jQuery.param.querystring(window.location.toString().replace("#", ""), params.replace("#", ""));
    res = res.replace(/%5B%5D=/g, "="); // hack for bbq adding extra [] to multiplied values
    window.History.replaceState(params, "", res);
    //var res = jQuery.param.querystring(window.location.toString(), params);
    //window.history.replaceState(params, "", res);
}

function SendLobbyCommand(link) {
    $.ajax({
        url: "/Lobby/SendCommand",
        data: {
            link: link
        },
        success: function(data) {
            if (data != null && data.length > 0) alert(data);
        },
        error: function() {
            alert("Error sending the command to lobby, please try again later");
        }
    });
}

function CopyToClipboard(elem) {
    // create hidden text element, if it doesn't already exist
    var targetId = "_hiddenCopyText_";
    var isInput = elem.tagName === "INPUT" || elem.tagName === "TEXTAREA";
    var isHref = elem.tagName === "A";
    var origSelectionStart, origSelectionEnd;
    var target;
    if (isInput) {
        // can just use the original source element for the selection and copy
        target = elem;
        origSelectionStart = elem.selectionStart;
        origSelectionEnd = elem.selectionEnd;
    } else if (isHref) {
        target = document.getElementById(targetId);
        if (!target) {
            target = document.createElement("textarea");
            target.style.position = "absolute";
            target.style.left = "-9999px";
            target.style.top = "0";
            target.id = targetId;
            document.body.appendChild(target);
        }
        target.textContent = elem.getAttribute("href");
    } else {
        // must use a temporary form element for the selection and copy
        target = document.getElementById(targetId);
        if (!target) {
            target = document.createElement("textarea");
            target.style.position = "absolute";
            target.style.left = "-9999px";
            target.style.top = "0";
            target.id = targetId;
            document.body.appendChild(target);
        }
        target.textContent = elem.textContent;
    }
    // select the content
    var currentFocus = document.activeElement;
    target.focus();
    target.setSelectionRange(0, target.value.length);

    // copy the selection
    var succeed;
    try {
        succeed = document.execCommand("copy");
    } catch (e) {
        succeed = false;
    }
    // restore original focus
    if (currentFocus && typeof currentFocus.focus === "function") {
        currentFocus.focus();
    }

    if (isInput) {
        // restore prior selection
        elem.setSelectionRange(origSelectionStart, origSelectionEnd);
    } else {
        // clear temporary content
        target.textContent = "";
    }
    return succeed;
}

function ToggleExtra(id, e) {
    // get element that is to be toggled
    var target = $("#" + id);
    if (!target) return;

    // toggle target visibility
    var target_state;
    if (target.is(":visible")) {
        target.slideUp();
        target_state = "up";
    } else {
        target.slideDown();
        target_state = "down";
    }

    // update toggle indicator if present
    if (e) {
        var indicator = $(e).children(".toggle-indicator");
        var upclass = "fa-caret-up"; //"fa-chevron-circle-up";
        var downclass = "fa-caret-down"; //"fa-chevron-circle-down";

        if (target_state == "up") {
            indicator.removeClass(upclass).addClass(downclass);
        } else if (target_state == "down") {
            indicator.removeClass(downclass).addClass(upclass);
        }
    }

}

function InitResourceRating() {
    // prevent unnecessary mouseover calls
    var mouseHovering = false;

    // initialize all ratings with zero stars
    $(".rating .level .fa").addClass("fa-star-o");

    // fill in ratings with values
    $(".rating .level.selected .fa").removeClass("fa-star-o").addClass("fa-star");

    // add mouse-over events
    $(".rating .level").hover(
        function () {
            // apply hover class when mouse over
            if (mouseHovering) return;
            mouseHovering = true;

            var parent = $(this).parent();
            var current = $(this);

            if (current.hasClass("l1")) {
                parent.children(".l1").addClass("hover");
            } else if (current.hasClass("l2")) {
                parent.children(".l1, .l2").addClass("hover");
            } else if (current.hasClass("l3")) {
                parent.children(".l1, .l2, .l3").addClass("hover");
            } else if (current.hasClass("l4")) {
                parent.children(".l1, .l2, .l3, .l4").addClass("hover");
            } else if (current.hasClass("l5")) {
                parent.children(".l1, .l2, .l3, .l4, .l5").addClass("hover");
            }
        },
        function () {
            // remove hover class when mouse out
            $(".rating .level").removeClass("hover");
            mouseHovering = false;
        }
    );

    // add click events
    $(".rating .level").click(function () {
        var parent = $(this).parent();
        var current = $(this);
        var ratingValue = 0;

        if (current.hasClass("l1")) {
            parent.children(".l1").addClass("selected");
            ratingValue = 1;
        } else if (current.hasClass("l2")) {
            parent.children(".l1, .l2").addClass("selected");
            ratingValue = 2;
        } else if (current.hasClass("l3")) {
            parent.children(".l1, .l2, .l3").addClass("selected");
            ratingValue = 3;
        } else if (current.hasClass("l4")) {
            parent.children(".l1, .l2, .l3, .l4").addClass("selected");
            ratingValue = 4;
        } else if (current.hasClass("l5")) {
            parent.children(".l1, .l2, .l3, .l4, .l5").addClass("selected");
            ratingValue = 5;
        }

        // call API to rate map with value
        /*
         * ?
         $("#rating").stars({
			callback: function (ui, type, value) {
				$.get('@Url.Action("Rate", new { id = m.ResourceID })?rating=' + value, function (ret) { if (ret != "") alert(ret); });
			}
		});
         */
    });
}

function InitToggleSwitch() {

    $(".switch3 .clickable").click(function (self) {
        var parent = $(this).parent();
        var input = parent.children("input");
        var slider = parent.children(".slider");

        if ($(this).hasClass("left")) {
            // clicked on the left side
            parent.toggleClass("active");
            slider.toggleClass("left");
            input.val("false");
        } else if ($(this).hasClass("right")) {
            // clicked on the right side
            parent.toggleClass("active");
            slider.toggleClass("right");
            input.val("true");
        }

        if (slider.hasClass("left") && slider.hasClass("right")) {
            // one side was active, and other side was clicked
            parent.removeClass("active");
            slider.removeClass("left");
            slider.removeClass("right");
            input.val("");
        } else if (!slider.hasClass("left") && !slider.hasClass("right")) {
            // no side is active anymore
            input.val("");
        }
    });
}

function openModal(id) {
    var modal = $("#" + id);
    console.log("open modal", id, modal);
    if (!modal || !$(modal).hasClass("modal")) return;
    modal.fadeIn();
    $("#modal-overlay").fadeIn();
}

function closeModal() {
    $(".modal:visible").fadeOut();
    $("#modal-overlay").fadeOut();
}

function GlobalPageInit(root) {

    // navigation transitions
    $(window).on('scroll', function () {
        // get position of top of viewport
        var top = Math.round($(window).scrollTop());
        var transition_point = $("#navtransition").offset().top;

        if (top > transition_point) {
            // affix nav to top of screen
            $("#menu").addClass("nav-affixed");
            $("#menu > div").addClass("nav-affixed");
        } else {
            // reset nav back to static position
            $("#menu").removeClass("nav-affixed");
            $("#menu > div").removeClass("nav-affixed");
        }

        // optional secondary transition
        var secondary_element = $("#summarytransition");
        if (secondary_element && secondary_element.length > 0) {
            var secondary_transition = secondary_element.offset().top - $("#menu").height();

            if (top > secondary_transition) {
                // affix secondary section to top of screen
                $(".page-summary").addClass("summary-affixed").css("top", $("#menu").height());
            } else {
                // reset secondary section back to static position
                $(".page-summary").removeClass("summary-affixed").css("top", 0);
            }
        }
        // ಠ_ಠ I know what you're thinking. Don't add another layer.
    });

    $(".modal-open").click(function () {
        var modalID = $(this).data("modal");
        openModal(modalID);
    });
    $(".modal-close").click(closeModal)
    $("#modal-overlay").click(closeModal);

    var s = root;
    if (s == null) s = $(document);

    s.find(".js_tabs").tabs({
        selected: parseInt($.getUrlVars().tab),
        ajaxOptions: {
            success: function(xhr, status, index, anchor) {
                $(document).find(".js_tabs").each(function() {
                    GlobalPageInit($(this));
                    ReplaceHistory("tab=" + $(this).tabs("option", "selected"));
                });
            }
        }
    });

    s.find(".js_confirm").click(function() {
        var answer = confirm("Do you really want to do it?");
        return answer;
    });

    s.find(".js_dialog").dialog(
        {
            autoOpen: true,
            show: "fade",
            hide: "fade",
            modal: false,
            width: 800,
            maxHeight: 600,
            open: function() {
                setTimeout(function () {
                    $('.js_dialog').scrollTop(0);
                }, 500);
            },
            buttons: { "Close": function() {$(this).dialog("close"); } }
        }
    );

    s.find(".js_datepicker").datepicker($.datepicker.regional["en"]);
    s.find(".js_datetimepicker").datetimepicker();

    // buttonification
    s.find(":submit").button();
    s.find(":button").button();
    s.find(".js_button").button();
    s.find(".js_accordion").accordion();

    // selection for gird
    s.find(".js_selectrow").click(function() {
        var tr = $(this).closest("tr");
        if (tr.hasClass("row_selected"))
            tr.removeClass("row_selected");
        else
            tr.addClass("row_selected");
    });

    /* ajax form updater and scorll based loader
    It updates form on submit using ajax - sending offset 0 to it when user clicks

    It also updates form when user scrolls to bottom - sending current offset to it, this continues until controller returns data.

    busy element is made visible to display loading progress
    */
    var frm = s.find("#ajaxScrollForm");
    var prg = s.find("#busy");
    var target = s.find("#ajaxScrollTarget");

    if (frm && typeof frm.attr("id") != "undefined") {
        window.onscroll = function() {
            if (!ajaxScrollEnabled) {
                return;
            }
            var el = document.documentElement;
            var page = $("body");
            // bugfix for ebkit based stuff 
            // chrome needs scrolLTop out of jquery by the page. Object Opera, IE, Firefox take the original dom property
            //var scrollTop = el.scrollTop;
            //if (scrollTop == null || scrollTop == 0)
            var scrollTop = page.scrollTop();
            if (scrollTop == 0) scrollTop = el.scrollTop;
            if (el.scrollHeight - (scrollTop + el.clientHeight) < 50) {
                ajaxScrollEnabled = false;
                prg.show();
                $.post(frm.attr("action"), frm.serialize() + "&offset=" + ajaxScrollOffset, function(ret) {
                    target.append(ret);
                    ajaxScrollOffset = ajaxScrollOffset + ajaxScrollCount;
                    if (ret == "") ajaxScrollEnabled = false;
                    else ajaxScrollEnabled = true;
                    prg.hide();
                });
            }
        };

        frm.submit(function() {
            ajaxScrollEnabled = false;
            ajaxScrollOffset = 0;
            prg.show();
            $.post(frm.attr("action"), frm.serialize() + "&offset=" + ajaxScrollOffset, function(ret) {
                target.html(ret);
                ajaxScrollOffset = ajaxScrollCount;
                ajaxScrollEnabled = true;
                prg.hide();
                ReplaceHistory(frm.serialize());

            });
            return false;
        });
    }


    // img zoomer
    s.find("img.zoom").each(function() {
        $.data(this, "size", { width: $(this).width(), height: $(this).height() });
    }).hover(function() {
        $(this).stop().animate({ height: $.data(this, "size").height * 4, width: $.data(this, "size").width * 4 }, 300);
    }, function() {
        $(this).stop().animate({ height: $.data(this, "size").height, width: $.data(this, "size").width }, 600);
    });

    s.find(".js_expand").toggler({ speed: 0 });

    s.find(".js_clipboard").click(function() {
        CopyToClipboard($(this).get(0));
        alert("Copied to clipboard, use ctrl+v to paste");
        return false;
    });


    s.find("[data-preview]").each(function (i, trigger) {
        var name = $(trigger).data("preview");
        var txtSource = "[name='" + name + "']";
        $(trigger).click(function() {
            $.post("/Forum/Preview", {
                text: $(txtSource).val()
            }, function(data) {
                var dialogDiv = $("<div></div>");
                dialogDiv.html(data);
                dialogDiv.appendTo(document.body);
                GlobalPageInit(dialogDiv);
                dialogDiv.dialog(
                {
                    autoOpen: true,
                    show: "fade",
                    hide: "fade",
                    modal: false,
                    title: "Preview (close before opening a new one)",
                    width: 800,
                    naxHeight : 600,
                    open: function() {
                        $(trigger).hide();
                        var refresh = function () {
                            $.post("/Forum/Preview", {
                                text: $(txtSource).val()
                            },
                                function(d2) {
                                    dialogDiv.html(d2);
                                    GlobalPageInit(dialogDiv);
                                });
                            //if (!$(trigger).is(":visible")) window.setTimeout(refresh, 2000);
                        };
                        setTimeout(function () {
                            $('.js_dialog').scrollTop(0);
                        }, 500);
                        //window.setTimeout(refresh, 2000);
                    },
                    close: function() {
                        dialogDiv.detach();
                        $(trigger).show();
                    },
                    buttons: {
                        "Close": function() {
                            $(this).dialog("close");
                        }
                    }
                });

                

                event.preventDefault();
            });
        });
    });

    s.find("[data-autocomplete]").each(function(i, el) {
        var url = $(el).data("autocomplete");
        var action = $(el).data("autocomplete-action");

        console.log("autocomplete for element", el);
        $(el).autocomplete({
            minLength: 1,
            delay: 0,
            source: url,
            select: function (event, ui) {
                if (action === "submit") {
                    $(el).closest("form").submit();
                } else if (action === "goto") {
                    document.location = ui.item.url;
                } else if (action === "add") {
                    var name = $(el)[0].id;
                    var form = $(el).closest("form");
                    $('<input>').attr({
                        type: 'hidden',
                        name: name + '',
                        id: name + 'userinput' + ui.item.id,
                        value: ui.item.id
                    }).appendTo(form);
                    //$('<span class="ui-autocomplete">' + ui.item.value + '</span>').appendTo(form);
                    removeButton = $(" <a ><img src='/img/delete_trashcan.png' class='icon16' /></a><br />");
                    userDisplay = $("<span></span>").data("item.autocomplete", ui.item).append($("<a></a> ").html(ui.item.label)).append(removeButton).appendTo($(form).find("#" + name + "players"));
                    userDisplay.attr({ id: name + 'userdisp' + ui.item.id });
                    $(removeButton).click(function () {
                        $(form).find("#" + name + "userinput" + ui.item.id).remove();
                        $(form).find("#" + name + "userdisp" + ui.item.id).remove();
                    });
                }
            }
        }).data('ui-autocomplete')._renderItem = function (ul, item) {
            item.label = item.label.replace("a href", "a hack");
            return $("<li></li>").data("item.autocomplete", item).append($("<a></a>").html(item.label)).appendTo(ul);
        };
    });

    SetupGrid(s);


    // OBSOLETE
    $(".qtip").remove(); // remove all floating tooltips - breaks autorefresh with init
}


// setup busy indicator
$(function() {
    $(document).ajaxStart(function () {
        isBusy += 1;
        setTimeout("if (isBusy > 0) $('#busy').show('fade');", 500);
    });
    $(document).ajaxStop(function () {
        isBusy -= 1;
        if (isBusy <= 0) $("#busy").fadeOut(1000);
    });
})