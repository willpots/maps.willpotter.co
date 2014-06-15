ImagoMundi::Application.routes.draw do
  get "data/capacity"
  get "map/index"
  get "map/hubway"

  root 'map#index'
end
