require 'test_helper'

class Data::MbtaControllerTest < ActionController::TestCase
  test "should get index" do
    get :index
    assert_response :success
  end

  test "should get routes" do
    get :routes
    assert_response :success
  end

end
