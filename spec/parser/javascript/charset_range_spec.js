import javascript from 'src/js/parser/javascript/parser.js';
import util from 'src/js/util.js';
import Q from 'q';

describe('parser/javascript/charset_range.js', function() {

  it('parses "a-z" as a CharsetRange', function() {
    var parser = new javascript.Parser('a-z');
    expect(parser.__consume__charset_range()).toEqual(jasmine.objectContaining({
      type: 'charset-range',
      first: jasmine.objectContaining({
        textValue: 'a'
      }),
      last: jasmine.objectContaining({
        textValue: 'z'
      })
    }));
  });

  it('throws an exception when the range is out of order', function() {
    var parser = new javascript.Parser('z-a');
    expect(() => {
      parser.__consume__charset_range();
    }).toThrow('Range out of order in character class: z-a');
  });

  describe('#_render', function() {

    beforeEach(function() {
      var parser = new javascript.Parser('a-z');
      this.node = parser.__consume__charset_range();

      this.node.container = jasmine.createSpyObj('cotnainer', ['addClass', 'text', 'group']);
      this.node.container.text.and.returnValue('hyphen');

      this.firstDeferred = Q.defer();
      this.lastDeferred = Q.defer();

      spyOn(this.node.first, 'render').and.returnValue(this.firstDeferred.promise);
      spyOn(this.node.last, 'render').and.returnValue(this.lastDeferred.promise);
      spyOn(util, 'spaceHorizontally');
    });

    it('renders a hyphen', function() {
      this.node._render();
      expect(this.node.container.text).toHaveBeenCalledWith(0, 0, '-');
    });

    it('spaces the items horizontally', function(done) {
      this.firstDeferred.resolve();
      this.lastDeferred.resolve();

      this.node._render()
        .then(() => {
          expect(util.spaceHorizontally).toHaveBeenCalledWith([
            this.node.first,
            'hyphen',
            this.node.last
          ], { padding: 5 });
        })
        .finally(done)
        .done();
    });

  });

});
