ImagoMundi::Application.routes.draw do
  namespace :data do
    get "mbta/index"
    get "mbta/routes"
    get "mbta/subway_lines"
    get "hubway/capacity"
  end

  get "map/index"
  get "map/hubway"

  root 'map#index'
end
