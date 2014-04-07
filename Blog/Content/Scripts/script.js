/// <reference path="jquery-2.1.0.js" />
/// <reference path="underscore.js" />
/// <reference path="mustache.js" />

/**
 * Основной класс приложения
 */
function Application() {

    var tree = new Tree();
    var tab  = new Tab();
    var post = new Post();
    var user = new User();
    var menu = new Menu();

    tree.OnSelect(function (name, id) {
        tab.Add(name, id);
    });

    tab.OnSelect(function (id) {
        post.Show(id);
    });

    tab.OnClose(function () {
        post.Clear();
    });

    menu.OnNew(function () {
        tab.Add('New Post', post.NewPostSequence.New());
    });

    post.OnPreview(function () {
        tab.Add('Preview', post.PreviewPostSequence.New());
    });

    this.Start = function () {

        tree.Refresh();

        user.Authorize();
    };
};

function Menu() {

    this.OnNew = function (callback) {
        $('#new-link').click(callback);
    };

    var self = this;
};

/**
 * Последовательность уникальных идентификаторов
 */
function IdSequence(start) {

    var self = this;
    var start = start;

    this.New = function () {
        return start += 1;
    };

    this.Is = function (id) {
        if(_.isString(id)) {
            if(id.indexOf(start.substring(0, 3)) != -1)
                return true;
        }

        return false;
    };
};

function User() {

    this.Login = function () {

        if ($('#login-link').text().indexOf('USER') != -1) {
            window.localStorage.removeItem('key');
            $('#login-link').text('LOGIN');
            return self.Authorize(null);
        }

        if (!self.Authorize())
            ShowLoginForm();
    };

    this.GetKey = function () {
        return window.localStorage.getItem('key');
    };

    function SetRules(admin, user) {
        var rules = document.styleSheets[0].cssRules;

        var deleteRule = function (rule) {
            for (var i = 0; i < rules.length; i++) {
                if (rules[i].selectorText.indexOf(rule) != -1) 
                    return document.styleSheets[0].deleteRule(i);
            }
        }

        deleteRule('admin');
        deleteRule('user');

        document.styleSheets[0].insertRule(admin, document.styleSheets[0].cssRules.length);
        document.styleSheets[0].insertRule(user, document.styleSheets[0].cssRules.length);
    };

    this.Authorize = function () {

        var key = window.localStorage.getItem('key');

        if (key == null) {
            SetRules('.admin { display: none; }', '.user { display: none; }');
            return false;
        }
        else {
            $.getJSON('/Blog/UserInfo?key=' + key, function (data) {

                $('#login-link').text('USER: ' + data.name);

                if (data.role.indexOf('admin') != -1) {
                    SetRules('.admin { display: inline-block; }', '.user { display: inline-block; }');
                }

                if (data.role.indexOf('user') != -1) {
                    SetRules('.admin { display: none; }', '.user { display: inline-block; }');
                }
            });

            return true;
        }
    };

    function ShowLoginForm() {
        $.get("Content/Templates/login.html", function (data) {
            $('main').prepend(Mustache.render(data, {}));

            $('#login-window-close-button').click(function () { $('#login-window').remove(); });
            $('.register-button').click(function () { LoginRequest('Register') });
            $('.login-button').click(function () { LoginRequest('Login') });

            gapi.signin.render('login-google', {
                'clientid': 'CLIENT_ID',
                'scope': 'https://www.googleapis.com/auth/plus.login',
                'requestvisibleactions': 'http://schemas.google.com/AddActivity',
                'cookiepolicy': 'single_host_origin',
                'callback': 'GoogleCallback'
            });
        });
    };

    function GoogleCallback(authResult) {
        var g = 0;
    };

    function LoginRequest(target) {
        $.getJSON('/Blog/' + target, {
            "login": $('#login-form > input[name="login"]').val(),
            "password": $('#login-form > input[name="password"]').val()
        },
        function (data) {

            if (!data.result)
                return $('#login-info-block').text(data.message);

            window.localStorage.setItem('key', data.key);

            self.Authorize();
            $('#login-window').remove();
        });
    };

    $('#login-link').click(this.Login);

    var self = this;
}

function Tab() {

    this.Add = function (title, id) {
        var newTab = new Tab(title, id);
        tabs.push(newTab);
    };

    this.selectTab = function (title) {
        for (t in tabs) {
            if (t.title.indexOf(title) != -1)
                return activateTab(t);
        }
    };

    this.OnSelect = function (callback) {
        onSelect = callback;
    };

    this.OnClose = function (callback) {
        onClose = callback;
    };

    var tabs = new Array();
    var activeTab = null;
    var onSelect = null;
    var onClose = null;

    function Tab(title, id) {
        this.title = title;
        this.id = id;

        this.html = $('<li>', { 'class': 'tab', 'text': title });
        var close_button = $('<div>', { 'class': 'tab-close' });
        var self = this;

        this.html.click(function (event) {
            activateTab(self);
        });

        close_button.click(function (event) {
            onClose();
            RemoveTab(self);
        });

        this.html.append(close_button);
        // check for tab panel overflow
        if ($('#tab-panel').find('li').length > 1) {
            if ($('#tab-panel li').first().width() * ($('#tab-panel').find('li').length + 1) > $('#tab-panel').width())
                RemoveTab(tabs[0]);
        }

        $('#tab-panel').append(this.html);

        activateTab(this);
    };

    function RemoveTab(tab) {
        var index = tabs.indexOf(tab);
        tabs.splice(index, 1);
        tab.html.remove();
        activateTab(tabs.length == 0 ? null : tabs[0]);
    };

    function activateTab(tab) {
        if(tab == null)
            return null;

        if (activeTab != null) {
            activeTab.html.removeClass('tab-selected');
        }

        tab.html.addClass('tab-selected');
        activeTab = tab;

        onSelect(tab.id);
    };
};

/**
 * Представляет коллекцию открытых постов
 */
function Post() {

    var self = this;
    var posts = new Array();
    var previewCallback = null;

    this.OnPreview = function (callback) {
        previewCallback = callback;
    };

    /**
     * Очищает область постов
     */
    this.Clear = function () {
        $('#post-content > div[data-postid]').css('display', 'none');
    };

    this.NewPostSequence = new IdSequence("NEW00000");
    this.PreviewPostSequence = new IdSequence("PRW00000");

    /**
     * Выводит на экран пост
     * @param {String} id - уникальный идентификатор поста
     */
    this.Show = function (id) {

        this.Clear();

        if (_.contains(posts, id)) {
            return $('#post-content > div[data-postid="' + id + '"]').css('display', 'block');
        }

        posts.push(id);

        if (this.NewPostSequence.Is(id)) {
            return $.get("Content/Templates/editor.html", function (data) {
                $('#post-content').prepend(Mustache.render(data, { "id": id }));

                $('#editor-save').click(function () {
                    $.post("/Blog/SavePost", {
                        "short_title": $('#editor input[name="short-title"]').val(),
                        "title": $('#editor input[name="full-title"]').val(),
                        "text": $('#editor-area').val(),
                        "key": window.localStorage.getItem('key')
                    }, function (data) {
                        alert(data.result ? 'Post saved' : 'Error while saving post: ' + data.message)
                    }, 'json');
                });

                $('#editor-preview').click(previewCallback);
            });
        }

        if (this.PreviewPostSequence.Is(id)) {
            return $.get("Content/Templates/preview.html", function (template) {
                $('#post-content').prepend(Mustache.render(template, {
                    "id": id,
                    "title": $('#editor input[name="full-title"]').val(),
                    "text": $('#editor-area').val()
                }));
            });
        }

        $.getJSON("/Blog/Post?id=" + id, function (data) {
            $.get("Content/Templates/post.html", function (template) {
                data.id = id;
                $('#post-content').prepend(Mustache.render(template, data));
            });
        });
    };
};

/**
 * Дерево статей блога. Делит все статьи по годам и месяцам. Выводит их краткие названия.
 * @param {String} data - JSON строка со списками статей
 */
function Tree() {

    this.Refresh = function () {
        $.getJSON("/Blog/Tree", function (data) {
            $("#explorer-content").empty();
            $("#explorer-content").append(BuildRoot(data));
        });
    };
    
    this.Refresh();
    this.Refresh();

    this.OnSelect = function (callback) {
        onSelect = callback;
    };

    var onSelect = null;

    var self = this;

    $('#explorer-menu-refresh').click(self.Refresh);

    /**
     * Собирает корень дерева
     * @param {Object} data - данные дерева 
     * @return {Object} - html представление корня дерева
     */
    function BuildRoot(data) {

        var root = CreateSection(data.name, 'tree-arrow', 'content/images/solution.png', 0);

        root.css({ 'padding-left': '-10px', 'margin-top': '7px' });
        data.child.forEach(function (item) {
            root.append(CreateSection(item.name, 'tree-arrow', 'content/images/solution.png', 16));

            var lastItem = root.find("ul:last");

            item.child.forEach(function (childItem) {
                var section = CreateSection(childItem.name, null, 'content/images/solution.png', 48);

                section.find('li').dblclick(select_callback);
                section.find('li').attr('data-post-id', childItem.id);

                lastItem.append(section);
            });
        });

        return root;
    };

    function CreateSection(name, arrow, icon, padding) {
        var ul = $('<ul>', { 'class': 'tree-container' });
        var li = $('<li>', { 'class': 'tree-node', 'data-focus': false, 'data-state': 'expanded' });
        var arrow = $('<div>', { 'class': arrow });
        var text = $('<span>', { 'text': name });
        var name = $('<div>', { 'class': 'tree-name' });
        var pic = $('<img>', { 'class': 'tree-icon', 'src': icon });

        arrow.click(expand_callback);
        li.click(activate_callback);

        li.css({ 'padding-left': padding + 'px' });

        return ul.append(li.append(arrow).append(name.append(pic).append(text)));
    }

    function expand_callback(event) {
        var li = $(event.target).parent('li');

        li.attr('data-state', li.attr('data-state') == 'expanded' ? 'collapse' : 'expanded');
    };

    function activate_callback(event) {
        $('#explorer li').attr('data-focus', false);
        $(this).attr('data-focus', true)
    };

    function select_callback(event) {
        onSelect($(this).find('span').text(), $(this).attr('data-post-id'));
    };
};

$(document).ready(function () {

    var application = new Application();

    application.Start();
});