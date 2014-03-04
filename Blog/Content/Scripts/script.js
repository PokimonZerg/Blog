/// <reference path="jquery-2.1.0.js" />

/**
 * Основной класс приложения
 */
function Application() {

    this.blogTree = new BlogTree();
    this.tabPanel = new TabPanel();
};

function TabPanel() {

    this.add = function (title, open, close) {
        var newTab = new Tab(title, calcTabPosition(), open, close);
        tabs.push(newTab);
        activateTab(newTab);
    };

    this.selectTab = function (title) {
        for (t in tabs) {
            if (t.title.indexOf(title) != -1)
                return activateTab(t);
        }
    };

    var tabs = new Array();
    var activeTab = null;

    function calcTabPosition() {
        // если табов нет, то первый будет расположен в начале
        if (tabs.length == 0)
            return 0;
        // если свобоного места не осталось, то закрываем первый таб
        if (tabs[tabs.length - 1].position >= $('.post').width()) {
            tabs[0].close();
            tabs.splice(0, 1);
        }
        
        return tabs[tabs.length - 1].position + 100;
    }

    function Tab(title, position, open, close) {
        this.position = position;
        this.close = close;
        this.open = open;
        this.title = title;

        this.tab = $('<div>', { 'class': 'tab', 'text': title });
        this.tab.css({ 'left': position });
        var tab_close = $('<div>', { 'class': 'tab-close' });

        this.tab.append(tab_close);
        $('.tab-panel').append(this.tab);
    };

    function activateTab(tab) {

        if (activeTab != null) {
            activeTab.tab.removeClass('tab-selected');
        }

        tab.tab.addClass('tab-selected');
        activeTab = tab;
        tab.open();
    };
};

/**
 * Дерево статей блога. Делит все статьи по годам и месяцам. Выводит их краткие названия.
 * @param {String} data - JSON строка со списками статей
 */
function BlogTree() {

    (this.refresh = function () {
        $.getJSON("/Blog/PostTree", function (data) {
            $(".explorer-content").replaceWith(buildRoot(data));
        });
    })();

    /**
     * Собирает корень дерева
     * @param {Object} data - данные дерева 
     * @return {Object} - html представление корня дерева
     */
    function buildRoot(data) {

        var root = createSection(data.name, 'tree-arrow', 'content/images/solution.png');

        root.css({ 'margin-left': '-10px', 'margin-top': '7px' });

        data.child.forEach(function (item) {
            root.find("li:first").append(createSection(item.name, 'tree-arrow', 'content/images/solution.png'));

            var lastItem = root.find("li:first").find("li:last");

            item.child.forEach(function (childItem) {

                lastItem.append(createSection(childItem.name, null, 'content/images/solution.png'));
            });
        });

        return root;
    };

    function createSection(name, arrow, icon) {
        var ul = $('<ul>', { 'class': 'tree-container' });
        var li = $('<li>', { 'class': 'tree-node' });
        var arrow = $('<div>', { 'class': arrow, 'data-state': 'expanded' });
        var text = $('<span>', { 'text': name });
        var name = $('<div>', { 'class': 'tree-name' });
        var pic = $('<img>', { 'class': 'tree-icon', 'src': icon });

        arrow.click(expand_callback);

        return ul.append(li.append(arrow).append(name.append(pic).append(text)));
    }

    function expand_callback(event) {
        event.target.setAttribute('data-state', event.target.getAttribute('data-state') == 'expanded' ? 'collapse' : 'expanded');
    };
};

$(document).ready(function () {

    var application = new Application();

    application.blogTree.refresh();

    application.tabPanel.add("test", function () { alert('open') }, function () { alert('close') });
    application.tabPanel.add("test2", function () { alert('open') }, function () { alert('close') });
});