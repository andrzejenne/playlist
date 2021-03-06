<?php

namespace BBIT\Playlist\Http\Controllers\Auth;

use BBIT\Playlist\Http\Controllers\Controller;
use BBIT\Playlist\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\AbstractProvider;

/**
 * Class SocialAuthController
 * @package BBIT\Playlist\Http\Controllers
 */
class SocialAuthController extends Controller
{
  /** @var bool */
  private $registrationOpen;

  /**
     * SocialAuthController constructor.
     */
    public function __construct()
    {
        $this->middleware('guest');

        $this->registrationOpen = config('app.registrationOpen');
    }

    /**
     * List of providers configured in config/services acts as whitelist
     *
     * @var array
     */
    protected $providers = [
        'github',
        'facebook',
        'google',
        'twitter'
    ];

    /**
     * Show the social login page
     *
     * @param Request $request
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function show(Request $request)
    {
        $requestToken = $request->get('token');
        $redirectUrl = $request->get('redirect');
        if ($requestToken) {
            session(['requestToken' => $requestToken]);
        }
        if ($redirectUrl) {
            session(['redirectUrl' => $redirectUrl]);
        }

        return view('auth.social');
    }

    /**
     * Redirect to provider for authentication
     *
     * @param string $driver
     * @return mixed
     */
    public function redirectToProvider($driver)
    {
        if (!$this->isProviderAllowed($driver)) {
            return $this->sendFailedResponse("{$driver} is not currently supported");
        }

        try {
            /** @var AbstractProvider $driver */
            $driver = Socialite::driver($driver);
            // @todo - cannot use, google has redirect url white list
//            if ($driver instanceof GoogleProvider) {
//                $session = session();
//                $driver->redirectUrl(config('services.google.redirect')
//                    . '?' . $session->getName() . '=' . $session->getId());
//            }

            return $driver->redirect();
        } catch (Exception $e) {
            // You should show something simple fail message
            return $this->sendFailedResponse($e->getMessage());
        }
    }

    /**
     * Handle response of authentication redirect callback
     *
     * @param string $driver
     * @return \Illuminate\Http\RedirectResponse
     */
    public function handleProviderCallback($driver)
    {
        try {
            $user = Socialite::driver($driver)->user();
        } catch (Exception $e) {
            return $this->sendFailedResponse($e->getMessage());
        }

        // check for email in returned user
        return empty($user->email)
            ? $this->sendFailedResponse("No email id returned from {$driver} provider.")
            : $this->loginOrCreateAccount($user, $driver);
    }

    /**
     * Send a successful response
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    protected function sendSuccessResponse()
    {
        return redirect()->intended(config('auth.redirectTo', 'home'));
    }

    /**
     * Send a failed response with a msg
     *
     * @param null|string $msg
     * @return \Illuminate\Http\RedirectResponse
     */
    protected function sendFailedResponse($msg = null)
    {
        return redirect()->route('social.login')
            ->withErrors(['msg' => $msg ?: 'Unable to login, try with another provider to login.']);
    }

    /**
     * @param User $providerUser
     * @param string $driver
     * @return \Illuminate\Http\RedirectResponse
     */
    protected function loginOrCreateAccount($providerUser, $driver)
    {
        // check for already has account
        /** @var User $user */
        $user = User::where('email', $providerUser->getEmail())->first();

        // if user already found
        if ($user) {
            // update the avatar and provider that might have changed
            $user->update([
                'avatar' => $providerUser->avatar,
                'provider' => $driver,
                'provider_id' => $providerUser->id,
                'access_token' => $providerUser->token
            ]);
        } else {
          if ($this->registrationOpen) {
            // create a new user
            /** @var User $user */
            $user = User::create([
              'name' => $providerUser->getName(),
              'email' => $providerUser->getEmail(),
              'avatar' => $providerUser->getAvatar(),
              'provider' => $driver,
              'provider_id' => $providerUser->getId(),
              'access_token' => $providerUser->token,
              // user can use reset password to create a password
              'password' => ''
            ]);
          }
          else {
            return $this->sendFailedResponse('Registration is forbidden');
          }
        }

        // login the user
        Auth::login($user, true);

        if (($requestToken = session('requestToken'))) {
//            $data = [$requestToken => $user];
//            session($data);
            Storage::put($requestToken . '.json', $user->toJson());
            session()->forget('requestToken');
        }
        if (($redirectUrl = session('redirectUrl'))) {
            session()->forget('redirectUrl');

            return redirect($redirectUrl);
        }

        return $this->sendSuccessResponse();
    }

    /**
     * Check for provider allowed and services configured
     *
     * @param string $driver
     * @return bool
     */
    private function isProviderAllowed($driver)
    {
        return in_array($driver, $this->providers) && config()->has("services.{$driver}");
    }
}
