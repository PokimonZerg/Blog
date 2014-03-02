/// <reference path="jquery-2.1.0.js" />

/**
 * Дерево статей блога. Делит все статьи по годам и месяцам. Выводит их краткие названия.
 * @param {String} data - JSON строка со списками статей
 */
function BlogTree(data) {

    // Данные дерева
    var data = data;

    /**
     * Собрает дерево по полученной спецификации
     * @return {String} - html представление дерева
     */
    this.build = function () {
        return buildRoot(data);
    };

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

    $.getJSON("/Blog/PostTree", function (data) {
        $(".explorer-content").append(new BlogTree(data).build());
    });
});