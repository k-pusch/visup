(function ($) {

    $(document).on('focus', ".input-field input", function(){
        var field = $(this).parents(".input-field");
        field.addClass("focus");
    });
    $(document).on('blur', ".input-field input", function(){
        var field = $(this).parents(".input-field");
        field.removeClass("focus");

        if($(this).val().length <= 0) {
            field.removeClass("active");
        }else{
            field.addClass("active");
        }
    });


    $(document).on('focus', ".select-field select", function(){
        var field = $(this).parents(".select-field");
        field.addClass("focus");
    });

    $(document).on('blur', ".select-field select", function(){
        var field = $(this).parents(".select-field");
        field.removeClass("focus");

        if($(this).val().length <= 0) {
            field.removeClass("active");
        }else{
            field.addClass("active");
        }
    });

})(jQuery);