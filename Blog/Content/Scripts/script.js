/// <reference path="jquery-2.1.0.js" />
/// <reference path="mustache.js" />

/**
 * Основной класс приложения
 */
function Application() {

    var self = this;

    this.tree = new Tree();
    this.post = new Post();
    this.user = new User();
    this.menu = new Menu();
    this.status = new Status();

    this.tree.OnSelect(function (name, id) {
        self.post.Add(name, id);
    });

    this.menu.OnNew(this.post.New);
    this.menu.OnLogin(this.user.Login);

    this.Start = function () {

        self.tree.Refresh();

        self.user.Authorize();
    };
};

function Menu() {

    this.OnNew = function (callback) {
        $('#new-link').click(callback);
    };

    this.OnLogin = function (callback) {
        $('#login-link').click(callback);
    };
};

function Status() {
    var self = this;

    this.Set = function (text) {
        $('#statusbar').text(text);
    };
};

function User() {

    this.Login = function () {

        if ($('#login-link').text().indexOf('USER') != -1) {
            window.localStorage.removeItem('key');
            if(typeof gapi != undefined)
                gapi.auth.signOut();
            $('#login-link').text('LOGIN');
            self.Authorize();
            return application.status.Set("Logout current user");
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
            $('.register-button').click(function () { application.user.LoginRequest('Register') });
            $('.login-button').click(function () { application.user.LoginRequest('Login') });
        });
    };

    this.LoginRequest = function (target, values) {
        $.getJSON('/Blog/' + target, (typeof values === 'undefined') ? {
            "login": $('#login-form > input[name="login"]').val(),
            "password": $('#login-form > input[name="password"]').val()
        } : values,
        function (data) {

            if (!data.result)
                return $('#login-info-block').text(data.message);

            window.localStorage.setItem('key', data.key);

            self.Authorize();
            $('#login-window').remove();
        });
    };

    var self = this;
}

/**
 * Представляет коллекцию открытых постов
 */
function Post() {

    var self = this;
    var posts = new Array();

    this.Add = function (title, id) {

        AddPost(id, title, function () {
            $.getJSON("/Blog/Post?id=" + id, function (data) {
                $.get("Content/Templates/post.html", function (template) {
                    data.id = id;
                    $('#post-content').prepend(Mustache.render(template, data));

                    $('div[data-postid="' + id + '"] .post-comment-save').click(function (event) {
                        var postid = $('div[data-postid]:visible').attr('data-postid');
                        var text = $('.post-comment-editor:visible').val();
                        $.post("/Blog/SaveComment", {
                            "text": text,
                            "post": postid,
                            "key": window.localStorage.getItem('key')
                        }, function (data) {
                            if (data.result == true) {
                                var title = $('.tab[data-postid="' + postid + '"]').text();
                                RemovePost(postid);
                                self.Add(title, postid);
                                application.status.Set("Comment saved");
                            } else {
                                application.status.Set("Error while saving comment: " + data.message);
                            }
                        });
                    });
                });
            });
        });

        application.status.Set("Open post '" + title + "'");
    };

    this.New = function () {
        AddPost("new", "New", function () {
            $.get("Content/Templates/editor.html", function (data) {
                $('#post-content').prepend(Mustache.render(data, { "id": "new" }));

                $('#editor-save').click(function () {
                    $.post("/Blog/SavePost", {
                        "short_title": $('#editor input[name="short-title"]').val(),
                        "title": $('#editor input[name="full-title"]').val(),
                        "text": $('#editor-area').val(),
                        "key": window.localStorage.getItem('key')
                    }, function (data) {
                        application.status.Set(data.result ? "Post saved" : "Error while saving post: " + data.message);
                    }, 'json');
                });

                $('#editor-preview').click(Preview);
            });
        });
    };

    function Preview() {
        RemovePost("preview");

        AddPost("preview", "Preview", function () {
            $.get("Content/Templates/preview.html", function (template) {
                $('#post-content').prepend(Mustache.render(template, {
                    "id": "preview",
                    "title": $('#editor input[name="full-title"]').val(),
                    "text": $('#editor-area').val()
                }));
            });
        });

        application.status.Set("Preview post");
    };

    function AddPost(id, title, content_callback) {
        // если пост уже был загружен
        if (posts.indexOf(id) != -1) {
            return ShowPost(id);
        }

        if (IsTabPanelFull()) {
            // показать сообщение
        } else {
            // добавляем пост в общий список
            posts.push(id);
            // добавляем содержимое поста на страницу блога
            content_callback();
            // добавляем таб с названием поста
            AddTab(title, id).done(function () {
                // показываем пост
                ShowPost(id);
            });
        }
    };

    function IsTabPanelFull() {
        return false;
    };

    function AddTab(title, id) {
        return $.get("Content/Templates/tab.html", function (template) {
            $('#tab-panel').append(Mustache.render(template, {
                "title": title,
                "id": id
            }));

            $('li[data-postid="' + id + '"]').click(function () {
                ShowPost(id);
            });

            $('li[data-postid="' + id + '"] > div').click(function () {
                RemovePost(id);
            });
        });
    };

    function ShowPost(id) {
        $('#tab-panel > .tab-selected').removeClass('tab-selected');
        $('#tab-panel > li[data-postid="' + id + '"]').addClass('tab-selected');
        $('#post-content > div[data-postid]').css('display', 'none');
        $('#post-content > div[data-postid="' + id + '"]').css('display', 'block');
    };

    function RemovePost(id) {
        // удаляем пост из списка
        posts.splice(posts.indexOf(id), 1);
        // удаляем пост со страницы
        $('#post-content > div[data-postid="' + id + '"]').remove();
        $('#tab-panel > li[data-postid="' + id + '"]').remove();
        // показываем другой пост
        if ($('#tab-panel > li[data-postid]').length != 0)
            ShowPost($('#tab-panel > li[data-postid]:first-child').attr('data-postid'));
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

            $.get("Content/Templates/tree.html", function (template) {
                $("#explorer-content").append(Mustache.render(template, data));

                $('#explorer-content .tree-arrow').click(ExpandNode);
                $('#explorer-content li').click(ActivateNode);
                $('#explorer-content li li li').dblclick(OpenPost);
            });
        });
    };

    function ExpandNode(event) {
        var li = $(this).parent('li');
        li.attr('data-state', li.attr('data-state') == 'expanded' ? 'collapse' : 'expanded');
    };

    function ActivateNode(event) {
        $('#explorer-content .tree-focus').removeClass('tree-focus');
        $(this).addClass('tree-focus');
        event.stopPropagation();
    };

    function OpenPost(event) {
        onSelect($(this).find('span').text(), $(this).attr('data-postid'));
        event.stopPropagation();
    };

    this.OnSelect = function (callback) {
        onSelect = callback;
    };

    var onSelect = null;
    var self = this;

    $('#explorer-menu-refresh').click(self.Refresh);
};

var application = null;

$(document).ready(function () {
    // запуск приложения
    application = new Application();
    application.Start();
});

function GoogleSignInCallback(authResult) {
    if (authResult['access_token']) {
        gapi.auth.setToken(authResult);
        gapi.client.load('oauth2', 'v2', function () {
            var request = gapi.client.oauth2.userinfo.get();
            request.execute(function (data) {
                if (data['id']) {
                    application.user.LoginRequest('Google', {
                        "name": data["name"],
                        "id": data["id"]
                    });
                    application.status.Set("Google login success. User: " + data["name"]);
                } else {
                    application.status.Set("Google login fail");
                }
            });
        });
    }
};