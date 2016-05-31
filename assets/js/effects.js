(function ($) {
    var $document = $(document);

    $document.on('focus', '.input-field input', function () {
        var field = $(this).parents('.input-field');

        field.addClass('focus');
    });

    $document.on('blur', '.input-field input', function () {
        var $this = $(this), field = $this.parents('.input-field');

        field.removeClass('focus');

        if ($this.val().length <= 0) {
            field.removeClass('active');
        } else {
            field.addClass('active');
        }
    });
})(jQuery);