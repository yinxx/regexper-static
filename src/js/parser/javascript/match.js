import _ from 'lodash';
import Q from 'q';

export default {
  type: 'match',

  _render() {
    var start, end,
        partPromises;

    if (this.anchorStart) {
      start = this.renderLabel('Start of line')
        .invoke('addClass', 'anchor');
    }

    if (this.anchorEnd) {
      end = this.renderLabel('End of line')
        .invoke('addClass', 'anchor');
    }

    partPromises = _.map(this.parts, part => {
      return part.render(this.container.group());
    });

    return Q.all(_([start, partPromises, end]).flatten().compact().value())
      .then(items => {
        var prev, next, paths;

        this.items = items;
        this.spaceHorizontally(items, {
          padding: 10
        });

        prev = this.normalizeBBox(_.first(items).getBBox());
        paths = _.map(items.slice(1), item => {
          var path;

          next = this.normalizeBBox(item.getBBox());
          path = `M${prev.ax2},${prev.ay}H${next.ax}`;
          prev = next;

          return path;
        });

        this.container.prepend(
          this.container.path(paths.join('')));
      });
  },

  setup() {
    this.parts = _.reduce(this.properties.parts.elements, function(result, node) {
      var last = _.last(result);

      if (last && node.canMerge && last.canMerge) {
        last.elements[0].merge(node.elements[0]);
      } else {
        result.push(node);
      }

      return result;
    }, []);

    this.anchorStart = this.properties.anchor_start.textValue !== '';
    this.anchorEnd = this.properties.anchor_end.textValue !== '';

    if (!this.anchorStart && !this.anchorEnd && this.parts.length === 1) {
      this.proxy = this.parts[0];
    }

    Object.defineProperty(this, '_anchor', {
      get: function() {
        var start = this.normalizeBBox(_.first(this.items).getBBox()),
            end = this.normalizeBBox(_.last(this.items).getBBox()),
            matrix = this.transform().localMatrix;

        return {
          ax: matrix.x(start.ax, start.ay),
          ax2: matrix.x(end.ax2, end.ay),
          ay: matrix.y(start.ax, start.ay)
        };
      }
    });
  }
};
