FROM ruby:2.2
RUN gem install jekyll bundler

RUN mkdir -p /app
WORKDIR /app

ADD Gemfile* /app/
RUN bundle install

EXPOSE 4000
CMD bundle exec jekyll serve --host=0.0.0.0 --drafts