define([
        'jQuery',
        'Underscore',
        'Backbone',
        "text!templates/weeklyScheduler/CreateTemplate.html",
        "models/WeeklySchedulerModel",
        "common",
        "populate",
        "dataService",
        'constants'
    ],
    function ($, _, Backbone, CreateTemplate, WeeklySchedulerModel, common, populate, dataService, CONSTANTS) {

        var CreateView = Backbone.View.extend({
            el         : '#content-holder',
            contentType: 'weeklyScheduler',
            template   : _.template(CreateTemplate),

            initialize: function (options) {
                var self = this;

                self.eventChannel = options.eventChannel;

                self.render();
            },

            events: {
                'keyup td[data-type="input"]': 'recalcTotal'
            },

            recalcTotal: function(e) {
                var self = this;
                var totalHours = 0;
                var $currentEl = this.$el;
                var hours;

                e.preventDefault();

                for (var i = 7; i > 0; i--) {
                    hours = parseInt($currentEl.find('td[data-content="' + i + '"] input').val());
                    totalHours += isNaN(hours) ? 0 : hours;
                }

                $currentEl.find('#totalHours span').text(totalHours);
            },

            saveItem: function () {
                var self = this;
                var model;
                var hours;
                var $currentEl = this.$el;

                var name = $.trim($currentEl.find('#weeklySchedulerName input').val());
                var totalHours = $currentEl.find('#totalHours span').text();

                var data = {
                    name: name,
                    totalHours: totalHours
                };

                if (!name) {
                    return App.render({
                        type: 'error',
                        message: 'name can\'t be empty'
                    });
                }

                for (var i = 7; i > 0; i--) {
                    hours = parseInt($currentEl.find('td[data-content="' + i + '"] input').val());
                    hours = isNaN(hours) ? 0 : hours;

                    if (hours < 0 || hours > 24) {
                        return App.render({
                            type: 'error',
                            message: 'hours should be in 0-24 range'
                        });
                    }

                    data[i] = hours;
                }

                model = new WeeklySchedulerModel();
                model.urlRoot = function () {
                    return 'weeklyScheduler';
                };

                model.save(data, {
                    patch  : true,
                    headers: {
                        mid: 103
                    },
                    wait   : true,
                    success: function () {
                        self.hideDialog();
                        self.eventChannel.trigger('updateWeeklyScheduler');
                    },
                    error  : function (model, xhr) {
                        self.errorNotification(xhr);
                    }
                });
            },

            hideDialog: function () {
                $(".edit-dialog").remove();
                $(".add-group-dialog").remove();
                $(".add-user-dialog").remove();
                $(".crop-images-dialog").remove();
            },

            render: function () {
                var formString = this.template();
                var self = this;

                this.$el = $(formString).dialog({
                    closeOnEscape: false,
                    autoOpen     : true,
                    resizable    : true,
                    dialogClass  : "edit-dialog",
                    title        : "Create WeeklyScheduler",
                    width        : "900px",
                    position     : {within: $("#wrapper")},
                    buttons      : [
                        {
                            id   : "create-weeklyScheduler-dialog",
                            text : "Create",
                            click: function () {
                                self.saveItem();
                            }
                        },

                        {
                            text : "Cancel",
                            click: function () {
                                self.hideDialog();
                            }
                        }]

                });

                this.delegateEvents(this.events);

                return this;
            }

        });

        return CreateView;
    });