/// <reference path="jquery-2.1.0.js" />

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

    menu.OnNew(function () {
        tab.Add('New Post', post.NewPostId);
    });

    post.OnPreview(function () {
        tab.Add('Preview', post.PreviewId);
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

    this.Authorize = function () {

        var key = window.localStorage.getItem('key');

        if (key == null) {
            $('.admin').css({ display: "none" });
            $('.user').css({ display: "none" });
            return false;
        }
        else {
            $.getJSON('/Blog/UserInfo?key=' + key, function (data) {

                $('#login-link').text('USER: ' + data.name);

                if (data.role.indexOf('admin') != -1) {
                    $('.admin').css({ display: "inline-block" });
                }

                if (data.role.indexOf('admin') != -1 || data.role.indexOf('admin') != -1) {
                    $('.user').css({ display: "inline-block" });
                }
            });

            return true;
        }
    };

    function ShowLoginForm() {
        var loginForm = $('<div id="login-window"></div>').html(
                '<div id="login-window-title">Login or Register' +
                '<div id="login-window-close-button"></div>' +
                '</div>' +
                '<form id="login-form">' +
                'Login: <input type="text" name="login">' +
                'Password: <input type="text" name="password"></form>' + 
                '<br><div id="login-buttons">' +
                '<button class="register-button">Register</button> ' +
                '<button class="login-button">Login</button>' +
                '<br><br><br><div id="login-google"></div>' +
                '<br><div id="login-info-block"></div></div>');

        loginForm.find('#login-window-close-button').click(function () { $('#login-window').remove(); });
        loginForm.find('.register-button').click(function () { LoginRequest('Register') });
        loginForm.find('.login-button').click(function () { LoginRequest('Login') });

        $('main').prepend(loginForm);

        gapi.signin.render('login-google', {
            'clientid': 'CLIENT_ID',
            'scope': 'https://www.googleapis.com/auth/plus.login',
            'requestvisibleactions': 'http://schemas.google.com/AddActivity',
            'cookiepolicy': 'single_host_origin',
            'callback': 'GoogleCallback'
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

    var tabs = new Array();
    var activeTab = null;
    var onSelect = null;

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

            RemoveTab(self);
        });

        this.html.append(close_button);
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

function Post() {

    this.OnPreview = function (callback) {
        previewCallback = callback;
    };

    /**
     * Выводит на экран пост
     * @param {String} name - имя поста
     */
    this.Show = function (id) {

        // save post data
        if ($('#editor').length != 0) {
            postData.shortTitle = $('#editor input[name="short-title"]').val();
            postData.title = $('#editor input[name="full-title"]').val();
            postData.text = $('#editor-area').val();
        }

        if (id == this.NewPostId)
            return this.New();

        if (id == this.PreviewId) {
            if ($('#editor').length == 0) return;

            return this.Preview({
                "title": $('#editor input[name="full-title"]').val(),
                "text": $('#editor-area').val()
            });
        }

        $.getJSON("/Blog/Post?id=" + id, function (data) {
            $('#post-content').html('<span class="post-keyword">namespace</span> Blog<br>' +
                                    '{' +
                                        '<div>' +
                                        '<span class="post-keyword">class</span> <header>' + data.title + '</header><br />' +
                                        '{' +
                                             '<div>' + data.text + '</div>' +
                                        '}' +
                                        '</div>' + (function () {
                                            for (var i = 0, out = ''; i < data.comments.length; i++) {
                                                out += '<br><div>' +
                                                        '<span class="post-keyword">class</span> <header>Comment</header><br />' +
                                                        '{' +
                                                            '<div>' + data.comments[i].text + '</div>' +
                                                        '}' +
                                                        '</div>';
                                            } return out;
                                        })() + '}');
        });
    };

    this.Preview = function (data) {
        $.post("/Blog/Preview", data, function (data) {
            $('#post-content').html('<span class="post-keyword">namespace</span> Blog<br>' +
                                    '{' +
                                        '<div>' +
                                        '<span class="post-keyword">class</span> <header>' + data.title + '</header><br />' +
                                        '{' +
                                             '<div>' + data.text + '</div>' +
                                        '}' +
                                        '</div>' + (function () {
                                            for (var i = 0, out = ''; i < data.comments.length; i++) {
                                                out += '<br><div>' +
                                                        '<span class="post-keyword">class</span> <header>Comment</header><br />' +
                                                        '{' +
                                                            '<div>' + data.comments[i].text + '</div>' +
                                                        '}' +
                                                        '</div>';
                                            } return out;
                                        })() + '}');
        }, 'json');
    };

    this.New = function () {
        $('#post-content').html(
            '<form id="editor">' +
            'Short title: <input type="text" name="short-title">' +
            'Full title: <input type="text" name="full-title">' +
            'Post content: <textarea id="editor-area"></textarea>' + 
            '</form><br>' +
            '<button id="editor-save">Save</button> ' +
            '<button id="editor-preview">Preview</button>'
          );

        $('#editor-save').click(function () {
            $.post("/Blog/SavePost", {
                "short_title": $('#editor input[name="short-title"]').val(),
                "title": $('#editor input[name="full-title"]').val(),
                "text": $('#editor-area').val()
            }, function (data) {
                alert(data.result ? 'Post saved' : 'Error while saving post: ' + data.message)
            }, 'json');
        });

        $('#editor-preview').click(previewCallback);

        // restore data
        $('#editor input[name="short-title"]').val(postData.shortTitle);
        $('#editor input[name="full-title"]').val(postData.title);
        $('#editor-area').val(postData.text);
    };

    this.NewPostId = 99999;
    this.PreviewId = 99998;

    var previewCallback = null;
    var postData = { shortTitle: "", title: "", text: "" };
    var self = this;
};

/**
 * Дерево статей блога. Делит все статьи по годам и месяцам. Выводит их краткие названия.
 * @param {String} data - JSON строка со списками статей
 */
function Tree() {

    (this.Refresh = function () {
        $.getJSON("/Blog/Tree", function (data) {
            $("#explorer-content").replaceWith(BuildRoot(data));
        });
    })();

    this.OnSelect = function (callback) {
        onSelect = callback;
    };

    var onSelect = null;

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