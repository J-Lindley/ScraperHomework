/* eslint-disable max-lines-per-function */
$(() => {
    // index.handlebars
    // save article
    $(".save-btn").on("click", (event) => {
        const $btn = $(event.target);
        const id = $btn.data("id");
        const article = $(`#${id}`).data("obj");

        $.post("/api/save", article).
            done((res) => { console.log(res); });
    });

    // saved.handlebars
    //show notes modal
    $(".notes-btn").on("click", (event) => {
        const $btn = $(event.target);
        const id = $btn.data("id");

        $.get(`/saved/${id}`).then((response) => {
            console.log(response);
            $(".modal-title").text(response.headline);
            if (response.comments.length) {
                console.log(response.comments);
                $("#comment-div").empty();
                const $list = $("<ul class='list-group'>").appendTo("#comment-div");

                response.comments.forEach((element) => {
                    const $li = $("<li class='list-group-item d-flex justify-content-between'>")
                        .attr("id", element._id)
                        .appendTo($list);
                    const $delete = $("<button class='btn btn-danger btn-sm comment-delete'>");

                    $("<span>").text(element.comment).appendTo($li);
                    $delete.data("id", element._id).text("x").appendTo($li);
                    $("<span>").append($delete).appendTo($li);
                });
            }
            $("#comments").modal();
            $("#comments").data("id", response._id);
        });
    });

    // delete article
    $(".article-delete").on("click", (event) => {
        const id = $(event.target).data("id");

        $.ajax(`/saved/${id}`, {
            method: "DELETE"
        }).then((response) => {
            console.log(response);
            // $(`#${response._id}`).remove();
            location.reload();
        });
    });

    // delete comment - instantiated as a body click event because the .comment-delete buttons don't exist yet.
    $("body").on("click", ".comment-delete", (event) => {
        const commentID = $(event.target).data("id");
        const articleID = $("#comments").data("id");

        console.log(commentID);
        console.log(articleID);
        // PUT instead of DELETE, because we're updating the Article when we delete the comment.
        $.ajax(`/saved/${articleID}`, {
            method: "PUT",
            data: { commentID }
        }).then((response) => {
            console.log(response);
            if (response.ok === 1) {
                $(`#${commentID}`).remove();
            }
        });
    });

    // saved.handlebars comments modal
    $("#comment-form").on("submit", (event) => {
        event.preventDefault();
        const comment = $("textarea").val();
        const id = $("#comments").data("id");

        console.log(id);
        $.post(`saved/${id}`, { comment }).then((response) => {
            console.log(response);
            location.reload();
        });
    });
});