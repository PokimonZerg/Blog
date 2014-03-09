/// <reference path="jquery-2.1.0.js" />

/**
 * Основной класс приложения
 */
function Application() {

    var tree = new Tree();
    var tab = new Tab();
    var post = new Post();

    tree.OnSelect(function (item) {
        tab.add(item);
    });

    tab.OnSelect(function (item) {
        post.Show(item);
    });

    this.Start = function () {

        tree.Refresh();
    };
};

function Tab() {

    this.add = function (title) {
        var newTab = new Tab(title, CalcTabPosition());
        tabs.push(newTab);
        activateTab(newTab);
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

    function CalcTabPosition() {
        // если табов нет, то первый будет расположен в начале
        if (tabs.length == 0)
            return 0;
        // если свобоного места не осталось, то закрываем первый таб
        if (tabs[tabs.length - 1].position + tabs[tabs.length - 1].html.width() * 2 >= $('#post').width()) {
            RemoveTab(tabs[0]);
        }
        
        return tabs[tabs.length - 1].position + 105;
    }

    function Tab(title, position) {
        this.position = position;
        this.title = title;

        this.html = $('<div>', { 'class': 'tab', 'text': title });
        this.html.css({ 'left': position });
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
    };

    function RemoveTab(tab) {
        var index = tabs.indexOf(tab);
        tabs.splice(index, 1);
        tab.html.remove();
        shiftTabs(index);
        activateTab(tabs.length == 0 ? null : tabs[0]);
    };

    function shiftTabs(index) {
        for (var i = index; i < tabs.length; i++) {
            tabs[i].html.css({ 'left': tabs[i].position - 105 });
            tabs[i].position -= 105;
        }
    };

    function activateTab(tab) {
        if(tab == null)
            return activateTab = null;

        if (activeTab != null) {
            activeTab.html.removeClass('tab-selected');
        }

        tab.html.addClass('tab-selected');
        activeTab = tab;

        onSelect(tab.title);
    };
};

function Post() {
    /**
     * Выводит на экран пост
     * @param {String} name - имя поста
     */
    this.Show = function(name) {
        /*$.getJSON("/Blog/Post", function (data) {

        });*/
        $('#post-content').empty();
        $('#post-content').append(GeneratePost(null));
    };

    function GeneratePost(data) {
        var namespace = $('<div>', { 'text': 'namespace Blog' });

        return namespace;
    };

    var postCash = new Array();
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
        onSelect($(event.target).find('span').addBack('span').text());
    };
};

$(document).ready(function () {

    var application = new Application();

    application.Start();
});