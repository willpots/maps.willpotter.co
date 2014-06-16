require "net/http"
require 'json'

class Data::MbtaController < ApplicationController
  def index
  end

  def subway_lines
    red = URI("http://developer.mbta.com/Data/Red.json")
    red_obj = JSON.parse(Net::HTTP.get(red))
    orange = URI("http://developer.mbta.com/Data/Orange.json")
    orange_obj = JSON.parse(Net::HTTP.get(orange))
    blue = URI("http://developer.mbta.com/Data/Blue.json")
    blue_obj = JSON.parse(Net::HTTP.get(blue))
    @data = {:red => red_obj, :orange => orange_obj, :blue => blue_obj}
    respond_to do |format|
      format.html do

      end
      format.json do
        render json: @data
      end
    end

  end

  # http://realtime.mbta.com/developer/api/v1/routes?api_key=<api_key>
  def routes
  end

  # http://realtime.mbta.com/developer/api/v1/stopsbyroute?api_key=<api_key>&route=<route_id> 
  def stop_list

  end

  # http://realtime.mbta.com/developer/api/v1/stopsbylocation?api_key=<api_key>&lat=<latitude>&lon=<longitude>
  def stops_by_location

  end

# http://realtime.mbta.com/developer/api/v1/schedulebystop?api_key=<api_key>&stop=<stop_id>&route=<route_id>&direction=<direction_id>&datetime=<unix_time>
  def stops_by_time

  end
end
